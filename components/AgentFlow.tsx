
import React, { useEffect, useRef } from 'react';
import {
  select,
  zoom as d3Zoom,
  hierarchy as d3Hierarchy,
  tree as d3Tree,
  zoomIdentity,
  linkVertical,
  drag as d3Drag,
  HierarchyPointNode,
  ZoomBehavior
} from 'd3';
import { AgentNode, AgentStatus, AgentType } from '../types';
import { COLORS } from '../constants';

interface AgentFlowProps {
  data: AgentNode[];
  activeNodeId: string | null;
  onNodeClick: (id: string) => void;
  dynamicIcons: Record<string, string>;
}

const FALLBACK_ICONS: Record<string, string> = {
  [AgentType.NOTEBOOK]: "M-5,2 L0,-10 L5,2 L-1,2 L1,10 Z",
  [AgentType.PLANNER]: "M-8,-2 L0,2 L8,-2 L0,-6 Z M-8,4 L0,8 L8,4 L0,0 Z M-8,-8 L0,-4 L8,-8 L0,-12 Z",
  [AgentType.IDEA]: "M-3,-3 A5,5 0 1 0 5,5 M3,3 L8,8",
  [AgentType.CODER]: "M-6,-5 L-10,0 L-6,5 M6,-5 L10,0 L6,5 M-2,7 L2,-7",
  [AgentType.ANALYSIS]: "M-6,6 L-6,-2 M0,6 L0,-8 M6,6 L6,2",
  [AgentType.VISUALIZER]: "M0,-9 L-8,-5 L-8,2 C-8,7 0,10 0,10 C0,10 8,7 8,2 L8,-5 Z",
  [AgentType.DS]: "M-6,-6 H6 V6 H-6 Z M0,-6 V-9 M0,6 V9 M-6,0 H-9 M6,0 H9",
};

const AgentFlow: React.FC<AgentFlowProps> = ({ data, activeNodeId, onNodeClick, dynamicIcons }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const zoomRef = useRef<ZoomBehavior<SVGSVGElement, unknown> | null>(null);

  useEffect(() => {
    if (!svgRef.current || !data.length) return;

    const svg = select(svgRef.current);
    svg.selectAll('*').remove();

    const width = svgRef.current.clientWidth;
    const height = svgRef.current.clientHeight;

    const container = svg.append('g').attr('class', 'viz-container');
    const tooltip = select(tooltipRef.current);

    const zoomBehavior = d3Zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on('zoom', (event) => {
        container.attr('transform', event.transform);
      });

    zoomRef.current = zoomBehavior;
    svg.call(zoomBehavior);

    const root = d3Hierarchy(data[0]);
    const treeLayout = d3Tree<AgentNode>().size([width - 240, height - 240]);
    treeLayout(root);

    // Center the view initially
    const initialTransform = zoomIdentity.translate(width / 2 - root.x!, 120);
    svg.call(zoomBehavior.transform as any, initialTransform);

    const defs = svg.append('defs');
    Object.entries(COLORS).forEach(([key, color]) => {
      const grad = defs.append('radialGradient')
        .attr('id', `grad-${key.toLowerCase()}`)
        .attr('cx', '50%')
        .attr('cy', '50%')
        .attr('r', '50%');
      grad.append('stop').attr('offset', '0%').attr('stop-color', color).attr('stop-opacity', 0.25);
      grad.append('stop').attr('offset', '100%').attr('stop-color', color).attr('stop-opacity', 0);
    });

    const linkGroup = container.append('g').attr('class', 'links');
    const updateLinks = () => {
      linkGroup.selectAll('.link')
        .data(root.links())
        .join('path')
        .attr('class', 'link')
        .attr('d', linkVertical()
          .x(d => (d as any).x)
          .y(d => (d as any).y) as any
        )
        .attr('fill', 'none')
        .attr('stroke', 'rgba(255,255,255,0.05)')
        .attr('stroke-width', 1.5);
    };
    updateLinks();

    const nodeGroup = container.selectAll('.node')
      .data(root.descendants())
      .enter()
      .append('g')
      .attr('class', d => `node status-${d.data.status}`)
      .attr('transform', d => `translate(${(d as any).x}, ${(d as any).y})`)
      .style('cursor', 'grab')
      .on('click', (event, d) => {
        event.stopPropagation();
        onNodeClick(d.data.id);
        
        // Smooth zoom focusing on the node
        const k = 1.5;
        const x = width / 2 - (d as any).x * k;
        const y = height / 2 - (d as any).y * k;
        
        svg.transition().duration(750).call(
          zoomBehavior.transform as any,
          zoomIdentity.translate(x, y).scale(k)
        );
      })
      .on('mouseover', (event, d) => {
        const nodeData = d.data;
        const statusColor = nodeData.status === AgentStatus.COMPLETED ? '#10b981' : 
                          nodeData.status === AgentStatus.FAILED ? '#ef4444' : 
                          nodeData.status === AgentStatus.WAITING ? '#f59e0b' :
                          (nodeData.status === AgentStatus.THINKING || nodeData.status === AgentStatus.EXECUTING) ? '#a855f7' : '#71717a';
        
        tooltip.transition().duration(200).style('opacity', 1);
        tooltip.html(`
          <div class="flex flex-col gap-2 min-w-[180px]">
            <div class="flex items-center justify-between gap-4">
              <span class="text-[12px] font-bold text-white uppercase tracking-wider">${nodeData.label}</span>
              <span class="text-[10px] px-2 py-0.5 bg-white/10 rounded border border-white/5 font-mono text-zinc-400">P${nodeData.priority || 5}</span>
            </div>
            <div class="h-[1px] w-full bg-white/10"></div>
            <div class="flex items-center gap-2">
              <div class="w-2 h-2 rounded-full ${nodeData.status === AgentStatus.THINKING ? 'animate-pulse' : ''}" style="background-color: ${statusColor}"></div>
              <span class="text-[10px] font-black uppercase tracking-widest" style="color: ${statusColor}">${nodeData.status}</span>
            </div>
            
            <div class="grid grid-cols-2 gap-2 mt-1">
               <div class="flex flex-col">
                 <span class="text-[7px] text-zinc-500 font-black uppercase tracking-widest">Compute</span>
                 <span class="text-[9px] text-zinc-300 font-mono">${nodeData.tokens || 0} tk</span>
               </div>
               <div class="flex flex-col">
                 <span class="text-[7px] text-zinc-500 font-black uppercase tracking-widest">Cost</span>
                 <span class="text-[9px] text-emerald-400 font-mono font-bold">$${nodeData.cost?.toFixed(4) || '0.00'}</span>
               </div>
            </div>

            <div class="text-[8px] text-zinc-600 font-black uppercase tracking-widest mt-1">Type: ${nodeData.type}</div>
            
            ${nodeData.dependencies?.length ? `
              <div class="mt-1 flex flex-col gap-1">
                <span class="text-[8px] text-zinc-600 font-black uppercase tracking-tighter">Blocking dependencies:</span>
                <div class="flex flex-wrap gap-1">
                  ${nodeData.dependencies.map(dep => `<span class="text-[7px] px-1.5 bg-zinc-800 text-zinc-400 rounded-sm border border-white/5">${dep}</span>`).join('')}
                </div>
              </div>
            ` : ''}
          </div>
        `)
        .style('left', (event.pageX + 20) + 'px')
        .style('top', (event.pageY - 20) + 'px');
      })
      .on('mousemove', (event) => {
        tooltip.style('left', (event.pageX + 20) + 'px')
               .style('top', (event.pageY - 20) + 'px');
      })
      .on('mouseout', () => {
        tooltip.transition().duration(200).style('opacity', 0);
      })
      .call(d3Drag<SVGGElement, HierarchyPointNode<AgentNode>>()
        .on('start', function() { select(this).style('cursor', 'grabbing').raise(); })
        .on('drag', function(event, d) {
          (d as any).x = event.x;
          (d as any).y = event.y;
          select(this).attr('transform', `translate(${event.x}, ${event.y})`);
          updateLinks();
          tooltip.style('opacity', 0);
        })
        .on('end', function() { select(this).style('cursor', 'grab'); })
      );

    nodeGroup.each(function(d) {
      const el = select(this);
      const isActive = d.data.id === activeNodeId;
      const isThinking = d.data.status === AgentStatus.THINKING;
      const isExecuting = d.data.status === AgentStatus.EXECUTING;
      const isFailed = d.data.status === AgentStatus.FAILED;
      const isCompleted = d.data.status === AgentStatus.COMPLETED;
      const isBusy = isThinking || isExecuting;
      
      const agentKey = d.data.type.replace('Agent', '').toUpperCase();
      const baseColor = (COLORS as any)[agentKey] || '#52525b';

      // Background radial glow
      el.append('circle')
        .attr('r', 60)
        .attr('fill', `url(#grad-${agentKey.toLowerCase()})`)
        .attr('opacity', isBusy || isActive ? 1 : 0.2);

      // Thinking Ripple
      if (isThinking) {
        el.append('circle')
          .attr('r', 40)
          .attr('fill', 'none')
          .attr('stroke', baseColor)
          .attr('stroke-width', 3)
          .attr('class', 'animate-ripple-out')
          .attr('opacity', 0.6);
      }

      let bodyClass = 'transition-all duration-300 ';
      if (isThinking) bodyClass += 'status-thinking-pulse';
      else if (isExecuting) bodyClass += 'status-executing-glow';
      else if (isFailed) bodyClass += 'status-failed-blink';
      else if (isCompleted) bodyClass += 'status-completed-stable';

      const priorityWeight = (d.data.priority || 5) / 10;
      const strokeWidth = isActive ? 4 : (2 + priorityWeight * 2);

      if (d.data.type === AgentType.PLANNER) {
        el.append('path')
          .attr('d', 'M 0 -35 L 35 0 L 0 35 L -35 0 Z')
          .attr('fill', '#050505')
          .attr('stroke', isFailed ? '#ef4444' : (isActive ? '#fff' : 'rgba(255,255,255,0.15)'))
          .attr('stroke-width', strokeWidth)
          .attr('class', bodyClass);
      } else {
        el.append('rect')
          .attr('x', -45).attr('y', -25).attr('width', 90).attr('height', 50).attr('rx', 14)
          .attr('fill', '#050505')
          .attr('stroke', isFailed ? '#ef4444' : (isActive ? '#fff' : 'rgba(255,255,255,0.15)'))
          .attr('stroke-width', strokeWidth)
          .attr('class', bodyClass);
      }

      const iconPath = dynamicIcons[d.data.type] || FALLBACK_ICONS[d.data.type];
      if (iconPath) {
        el.append('path')
          .attr('d', iconPath)
          .attr('fill', 'none')
          .attr('stroke', isActive ? '#fff' : (isFailed ? '#ef4444' : (isCompleted ? '#10b981' : baseColor)))
          .attr('stroke-width', 2.5)
          .attr('stroke-linecap', 'round')
          .attr('transform', 'scale(1.3)');
      }

      el.append('text')
        .attr('dy', 65).attr('text-anchor', 'middle')
        .attr('fill', 'currentColor').attr('font-size', '11px').attr('font-weight', '700').attr('letter-spacing', '0.05em')
        .text(`${d.data.label} ${d.data.priority ? `(P${d.data.priority})` : ''}`);

      el.append('text')
        .attr('dy', 80).attr('text-anchor', 'middle')
        .attr('fill', isCompleted ? '#10b981' : isFailed ? '#ef4444' : isBusy ? '#a855f7' : '#71717a')
        .attr('font-size', '9px').attr('font-weight', '900').attr('letter-spacing', '0.15em')
        .attr('class', isBusy ? 'animate-pulse' : '')
        .text(d.data.status.toUpperCase());
    });
  }, [data, activeNodeId, onNodeClick, dynamicIcons]);

  return (
    <div className="w-full h-full relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(#ffffff05_1px,transparent_1px)] [background-size:32px_32px] opacity-40"></div>
      
      <div 
        ref={tooltipRef} 
        className="fixed pointer-events-none opacity-0 z-[100] material-surface px-5 py-4 rounded-2xl border border-white/10 shadow-2xl backdrop-blur-3xl transition-opacity duration-200"
      ></div>

      <div className="absolute top-10 left-10 z-20 flex flex-col gap-6 pointer-events-none select-none">
        <div className="space-y-3">
          <div className="flex items-center gap-4">
             <div className="w-4 h-4 rounded-full bg-purple-500 shadow-[0_0_20px_#a855f7] animate-pulse"></div>
             <h3 className="text-[14px] font-black uppercase tracking-[0.6em]">Flynt Topology Engine</h3>
          </div>
          <div className="flex flex-col gap-1 pl-8">
            <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Protocol v4.0 (Cluster Matrix)</p>
            <p className="text-[9px] text-zinc-700 font-mono tracking-tighter">LATENCY: 12ms | OPS: 1.4M/s</p>
          </div>
        </div>
      </div>
      
      <svg ref={svgRef} className="w-full h-full relative z-10" />
      
      <style>{`
        .status-thinking-pulse { animation: thinkingPulse 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
        .status-executing-glow { animation: executingGlow 1.2s ease-in-out infinite; }
        .status-failed-blink { animation: failedBlink 0.4s step-end infinite; }
        .status-completed-stable { filter: drop-shadow(0 0 8px rgba(16, 185, 129, 0.4)); stroke: #10b981; }
        
        .animate-ripple-out { animation: rippleOut 2s linear infinite; }
        
        @keyframes thinkingPulse {
          0%, 100% { filter: brightness(1); opacity: 0.8; }
          50% { filter: brightness(1.4) drop-shadow(0 0 10px rgba(168, 85, 247, 0.4)); opacity: 1; }
        }
        
        @keyframes executingGlow {
          0%, 100% { filter: brightness(1.2) drop-shadow(0 0 12px rgba(99, 102, 241, 0.4)); }
          50% { filter: brightness(1.8) drop-shadow(0 0 30px rgba(99, 102, 241, 0.7)); }
        }
        
        @keyframes failedBlink {
          0%, 100% { stroke: #ef4444; stroke-width: 4; filter: drop-shadow(0 0 15px rgba(239, 68, 68, 0.6)); }
          50% { stroke: #450a0a; stroke-width: 2; filter: none; }
        }
        
        @keyframes rippleOut {
          0% { transform: scale(0.8); opacity: 0.8; stroke-width: 4; }
          100% { transform: scale(1.8); opacity: 0; stroke-width: 0.5; }
        }
        
        .viz-container { transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
      `}</style>
    </div>
  );
};

export default AgentFlow;
