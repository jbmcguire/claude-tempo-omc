---
description: Iterative planning with Gatherer, Planner, Architect, and Critic until consensus. Based on team-skills design-spec.
aliases: [plan, ctplan]
---

# ct-plan Command

[CT-PLAN ACTIVATED - ITERATIVE PLANNING CONSENSUS MODE]

## User's Task

{{ARGUMENTS}}

## Overview

ct-plan orchestrates four specialized agents—Gatherer, Planner, Architect, and Critic—in an iterative loop until consensus is reached on a comprehensive product spec. This ensures specs are complete, testable, and ready for implementation before any code is written.

## The Planning Quartet

| Agent | Role | Output |
|-------|------|--------|
| **Gatherer** | Requirements Interviewer | Collected requirements |
| **Planner** | Spec Writer | Product specification |
| **Architect** | Completeness Validator | Review notes |
| **Critic** | Quality Gate | OKAY or REJECT verdict |

## The Iteration Loop

```
┌─────────────────────────────────────────────────────────────────┐
│                       CT-PLAN LOOP                              │
│                                                                 │
│    ┌──────────────┐                                             │
│    │   GATHERER   │ ← Interactive requirements                  │
│    │  (Collects)  │                                             │
│    └──────┬───────┘                                             │
│           │                                                     │
│           ▼                                                     │
│    ┌──────────────┐                                             │
│    │   PLANNER    │◄────────────────────────────────┐           │
│    │  (Specs)     │                                 │           │
│    └──────┬───────┘                                 │           │
│           │                                         │           │
│           ▼                                         │           │
│    ┌──────────────┐     Questions?    ┌───────────┐ │           │
│    │  ARCHITECT   │─────────────────► │  Clarify  │ │           │
│    │  (Validates) │                   │  w/ User  │ │           │
│    └──────┬───────┘                   └───────────┘ │           │
│           │                                         │           │
│           ▼                                         │           │
│    ┌──────────────┐                                 │           │
│    │    CRITIC    │                                 │           │
│    │  (Reviews)   │                                 │           │
│    └──────┬───────┘                                 │           │
│           │                                         │           │
│           ▼                                         │           │
│    ┌──────────────┐     REJECT      ┌──────────────┐│           │
│    │   Verdict?   │─────────────────►│  Feedback   ││           │
│    └──────┬───────┘                  │ to Planner  │┘           │
│           │                          └─────────────┘            │
│           │ OKAY                                                │
│           ▼                                                     │
│    ┌──────────────────────────────────────────────────────────┐ │
│    │                  SPEC APPROVED                           │ │
│    │        Ready for /ct-implement or manual work            │ │
│    └──────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

## State Management

ct-plan maintains persistent state in `.claude-tempo/plan-state.json`:

```json
{
  "active": true,
  "mode": "ct-plan",
  "iteration": 1,
  "max_iterations": 5,
  "spec_path": ".claude-tempo/specs/[feature].md",
  "current_phase": "gatherer",
  "started_at": "ISO-timestamp",
  "task_description": "[original task]",
  "team_approvals": {
    "required": ["Jonathan", "Erik"],
    "received": []
  }
}
```

**Phases:** `gatherer` → `planner` → `architect` → `critic` → `verdict_handling` → `gate` → `complete`

## Execution Protocol

### Phase 1: Initialize

1. Create `.claude-tempo/` directory if needed
2. Create `plan-state.json` with initial values
3. Create `.claude-tempo/specs/` for spec storage

### Phase 2: Requirements Gathering

Invoke the **Gatherer** agent:
- Ask questions ONE AT A TIME
- Cover: problem, users, capabilities, constraints, scope
- Tempo-specific: which repos affected, existing patterns
- Output: Structured requirements document

Store requirements in state.

### Phase 3: Planning

Invoke the **Planner** agent:
- Receives requirements (and any prior Critic feedback)
- Creates comprehensive product spec
- **NO TECHNICAL DETAILS** — product language only
- Outputs to `.claude-tempo/specs/[feature].md`

Signal: `SPEC_READY: .claude-tempo/specs/[filename].md`

### Phase 4: Architecture Review

Invoke the **Architect** agent:
- Reviews spec for completeness
- Identifies gaps and ambiguities
- Flags hidden dependencies
- **Does NOT approve/reject** — provides notes for Critic

### Phase 5: Critic Review (MANDATORY)

Invoke the **Critic** agent:
- Final quality gate
- Checks for technical leakage
- Verifies testability of all DoD items
- Renders verdict: `OKAY` or `REJECT`

**CRITICAL:** This phase CANNOT be skipped.

### Phase 6: Verdict Handling

**If OKAY:**
- Mark spec as approved
- Proceed to Team Gate

**If REJECT:**
- Increment iteration counter
- Feed feedback to Planner
- Loop back to Phase 3
- Max 5 iterations before escalation

### Phase 7: Team Gate

Post gate for team approval:

```markdown
## [GATE] Design Review

Product spec is ready for team review.

| Team Member | Status |
|-------------|--------|
| Jonathan    | ⏳ Pending |
| Erik        | ⏳ Pending |

**To approve:** /ct-approve [feature]
**To request changes:** /ct-revise [feature] "feedback"
```

Wait for both approvals before proceeding.

### Phase 8: Complete

When all approvals received:
- Update state to complete
- Create Linear project with spec
- Output next steps

```
✅ Spec approved by team

Linear Project: BOLT-XXX "[Feature Name]"

Next steps:
  /ct-implement BOLT-XXX    # Start implementation
  /ct-feature BOLT-XXX      # Set up multi-repo branches
```

## Iteration Rules

| Rule | Description |
|------|-------------|
| **Max 5 iterations** | Safety limit prevents infinite loops |
| **Gatherer runs once** | Requirements collected upfront |
| **Planner owns spec** | Only Planner writes spec file |
| **Critic has veto** | Spec approved only on OKAY |
| **Team gate required** | Both Erik and Jonathan must approve |
| **State persists** | Survives session interruptions |

## Recovery

If interrupted, read `.claude-tempo/plan-state.json` and resume from `current_phase`.

## Cancellation

To stop: `/ct-cancel` or delete `.claude-tempo/plan-state.json`
