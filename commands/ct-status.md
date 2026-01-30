---
description: Show workflow status, phases, and pending approvals
aliases: [status, ctstatus]
---

# ct-status Command

View current state of a feature workflow.

## Usage

```
/ct-status                    # Current feature
/ct-status BOLT-456           # Specific feature
/ct-status --team             # All team activity
```

## Output

### Feature Status

```
/ct-status BOLT-456
```

```
╔══════════════════════════════════════════════════════════════╗
║  BOLT-456 "Settlement Payments"                              ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║  Phase: Implementation                                       ║
║  Started: Jan 30, 2026 10:15 AM                              ║
║                                                              ║
╠══════════════════════════════════════════════════════════════╣
║  GATES                                                       ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║  1. Design Review     ✅ Passed                              ║
║     └─ Jonathan ✅ (10:30 AM)                                ║
║     └─ Erik ✅ (10:45 AM)                                    ║
║                                                              ║
║  2. Impl Review       ⏳ CURRENT GATE                        ║
║     └─ Jonathan ⏳ Pending                                   ║
║     └─ Erik ⏳ Pending                                       ║
║                                                              ║
║  3. Final Review      ○ Not started                          ║
║                                                              ║
╠══════════════════════════════════════════════════════════════╣
║  REPOS                                                       ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║  tempo                                                       ║
║  └─ Branch: feature/BOLT-456-settlement-payments             ║
║  └─ Status: ✅ Complete (5 commits)                          ║
║  └─ PR: #123 (ready for review)                              ║
║                                                              ║
║  tempo-client                                                ║
║  └─ Branch: feature/BOLT-456-settlement-payments             ║
║  └─ Status: 🔄 In Progress (3 commits)                       ║
║  └─ PR: Not created                                          ║
║                                                              ║
╠══════════════════════════════════════════════════════════════╣
║  ARTIFACTS                                                   ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║  📋 Product Spec      .claude-tempo/specs/BOLT-456.md        ║
║  📝 Feature Context   .claude-tempo/features/BOLT-456.md     ║
║                                                              ║
╠══════════════════════════════════════════════════════════════╣
║  NEXT ACTION                                                 ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║  Complete tempo-client work, create PR, then:                ║
║  /ct-approve BOLT-456                                        ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
```

### Team Status

```
/ct-status --team
```

```
╔══════════════════════════════════════════════════════════════╗
║  TEAM STATUS                                                 ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║  ACTIVE FEATURES                                             ║
║  ─────────────────────────────────────────────────────────── ║
║  BOLT-456 "Settlement Payments"                              ║
║  └─ Phase: Implementation | Gate: Impl Review (0/2)          ║
║  └─ Last: Jonathan working on tempo-client                   ║
║                                                              ║
║  BOLT-423 "Driver Mobile App"                                ║
║  └─ Phase: Planning | Gate: Design Review (1/2)              ║
║  └─ Last: Erik approved, waiting for Jonathan                ║
║                                                              ║
║  PENDING APPROVALS                                           ║
║  ─────────────────────────────────────────────────────────── ║
║  For Jonathan:                                               ║
║    • BOLT-423 Design Review — /ct-approve BOLT-423           ║
║                                                              ║
║  For Erik:                                                   ║
║    • (none)                                                  ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
```

### Compact Mode

```
/ct-status BOLT-456 --compact
```

```
BOLT-456 "Settlement Payments"
Phase: Implementation | Gate: Impl Review (0/2)
tempo: ✅ PR #123 | tempo-client: 🔄 no PR
Next: /ct-approve BOLT-456
```

## Status Indicators

| Symbol | Meaning |
|--------|---------|
| ✅ | Complete / Approved |
| ⏳ | In Progress / Waiting |
| 🔄 | Active work |
| ○ | Not started |
| ❌ | Failed / Rejected |

## State Source

Reads from:
- `.claude-tempo/plan-state.json` (planning workflow)
- `.claude-tempo/features/BOLT-456.md` (feature state)
- Git branches and PRs
- Linear issue (if linked)
