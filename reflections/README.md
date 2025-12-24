# Flynt Studio

Your Personal Developer Assistant — build agentic AI projects rapidly.

Flynt Studio is an enterprise grade meta-agentic platform for developers, data scientists, media creators, ML engineers, and students. With Flynt Studio developing E2E solutions from creating simple, personal microservices, comprehensive learning modules, to complex Machine Learning Models, Fine-tuning, and media generation has never been seamless you can a single line idea into feasible, production grade projects using a set of specialized agents. with a powerful CLI, and multi-provider LLM integration with offline support Flynt Studio is not just another Ai, it is actually reliable, privacy-first Ai. Flynt Studio helps you go from ideation → planning→ execution with safe file operations, rollback, and test-mode support.

---

## Highlights

- Fully functional CLI with 16 commands for end-to-end workflows
- Robust meta-agentic framework
- Multi-provider LLM integration with graceful fallbacks
- Hybrid llm support with OLLAMA for private, offline operations, no security concerns
- GDPR Compliant by default
- Deterministic test-mode for offline development and CI
- Safe file operations with backups and rollback
- SQLite persistence for projects, tasks and execution history,
- FileOps, RAG and MCP servers built-in
- Supports Python, R, C++, Java, JavaScript, and TypeScript code generation

---

## Quick features overview

- CLI: 16 commands available (see below)
- Agents: IdeaAgent, PlannerAgent, CoderAgent, NotebookAgent, DataScienceAgent 
  DataAnalysisAgent, VisualizerAgent, MediaAgent, FinetuningAgent, 
- Core modules: CLI, Agent framework, StateManager (SQLite), Execution Engine, CI-CD 
- File structure produced by code gen: src/, tests/, config/
- Config: YAML-based with environment variable support

---

## CLI Commands

All commands are available through the `flynt` CLI. Example: `flynt --help`

- init — Initialize Flynt
- new — Create new project
- list — List all projects
- show — Display project details
- ideate — Start ideation phase
- plan — Break down into tasks
- execute — Run code generation
- code — Generate code directly
- config — Manage configuration
- llm-health — Check LLM provider status
- roadmap — View project roadmap
- status — Project status overview
- tasks — Manage project tasks
- history — View execution history
- review — Code review functionality
- rollback — Rollback changes

---

## Agent Framework

-Agents inherit from a BaseAgent with standardized lifecycle, logging and LLM client integration.
-All agents include verbose logging and an execution interface for orchestration.

---

## Typical Workflow

1. Create a new project
   - flynt new "My Project"
2. Ideate
   - flynt ideate "My Project"
3. Plan
   - flynt plan "My Project"
4. Generate code (test-mode available)
   - flynt execute "My Project" --test-mode
5. Review / Show
   - flynt show "My Project"
6. Rollback if needed
   - flynt rollback "My Project"

Example:
```bash
$ flynt new "RAG Chatbot for Job Search"
$ flynt ideate "RAG Chatbot for Job Search"
$ flynt plan "RAG Chatbot for Job Search"
$ flynt execute "RAG Chatbot for Job Search" --test-mode
$ flynt show "RAG Chatbot for Job Search"
```

---

## Installation (developer)

These are general steps — adjust for your environment.

1. Clone the repo:
   - git clone https://github.com/Liberty-io/Flynt-Studio.git
2. Create a virtualenv and install dependencies:
   - python -m venv .venv
   - source .venv/bin/activate
   - pip install -r requirements.txt
3. Configure credentials and settings (YAML + environment variables)
   - Copy `config/example.yaml` -> `config/local.yaml` and set API keys or use env vars
4. Run the CLI:
   - flynt --help
   - or python -m flynt <command>

Notes:
- Flynt supports multiple LLM providers (Gemini 3.0, Llama3.2, Devstral, Qwen3 via OpenRouter, and  Ollama). Configure provider credentials in YAML or ENV.
- Use `--test-mode` when you want deterministic offline behavior (useful for CI or development without LLM calls).

---

## Persistence & State

- SQLite database: Flynt.db
- Models for Project and Task tracking
- History of executions and status tracking are persisted for reproducibility and auditing

---

## Logging & Safety

- Structured logging to console and file
- Safe file operations: create with backup, validate before apply, and rollback support
- Execution engine applies patches and keeps traceable changes

---

## Contributing

We welcome contributions.

- Open issues for bug reports and feature requests
- Use branches for changes and create PRs targeting the `main` branch
- Include tests and update documentation when applicable
- Run the test suite and linters before submitting PRs

Suggested local workflow:
```bash
git checkout -b feat/my-change
# make changes
pytest
# commit and push
```

---

## Validation & Status

Current internal validation (from system overview):

- Syntax: 16/16 files passed
- Imports: 9/9 classes functional
- CLI: 16/16 commands registered
- Agents: 4/4 initialized
- Workflow: End-to-end tested
- Code Gen: Produces valid files
- System Status: Fully operational, production-ready (per internal checks)

---

## License

This repository is licensed under the MIT License. See LICENSE for details.

---

## Contact

Maintainers: Liberty-io
Repository: https://github.com/Liberty-io/Flynt-Studio

If you need help getting started, open an issue or reach out via the repo discussions.
