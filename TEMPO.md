# Tempo Customizations

This fork of [oh-my-claudecode](https://github.com/Yeachan-Heo/oh-my-claudecode) adds Tempo-specific workflows for the Bolt System team.

## Tempo-Specific Agents

| Agent | File | Purpose |
|-------|------|---------|
| **Backend Engineer** | `agents/backend-engineer.md` | Laravel/Tempo API specialist |
| **Frontend Engineer** | `agents/frontend-engineer.md` | Vue/Tempo-Client specialist |
| **Gatherer** | `agents/gatherer.md` | Requirements collection |

## Tempo-Specific Skills

| Skill | File | Purpose |
|-------|------|---------|
| **design-spec** | `skills/design-spec.md` | Product-level feature specs for Linear |

## Tempo Commands

| Command | Purpose |
|---------|---------|
| `/ct-plan` | Multi-agent planning with consensus loop |
| `/ct-feature` | Multi-repo feature coordination |
| `/ct-approve` | Team gate approvals |
| `/ct-status` | Workflow status |

## Repos

| Repo | Path | Type |
|------|------|------|
| **tempo** | `~/Developer/Herd/tempo` | Laravel API |
| **tempo-client** | `~/Developer/Work/tempo-client` | Vue frontend |

## References

- `references/backend-patterns.md` — Laravel patterns for Tempo
- `references/frontend-patterns.md` — Vue patterns for Tempo-Client

## Gated Workflow

```
Plan → 🚦 Design Review → Implement → 🚦 Code Review → Test → 🚦 Ship
         (Erik + Jonathan)              (Erik + Jonathan)
```

Both team members must approve at each gate.

## Usage

```bash
# Install
/plugin marketplace add https://github.com/jbmcguire/claude-tempo-omc
/plugin install claude-tempo-omc

# Setup (runs oh-my-claudecode setup + Tempo config)
/omc-setup

# Plan a feature
/ct-plan "Settlement payments for carriers"

# Or use autopilot with Tempo context
autopilot: build carrier settlement feature for tempo + tempo-client
```
