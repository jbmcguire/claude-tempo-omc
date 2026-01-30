---
description: Approve a gate to proceed to the next phase. Supports multi-person approval.
aliases: [approve, ctapprove]
---

# ct-approve Command

Add your approval to a gate checkpoint.

## Usage

```
/ct-approve BOLT-456
/ct-approve BOLT-456 --force    # Override (use sparingly)
```

## Behavior

### 1. Identify Approver

Determine who is running the command from git config or environment.

### 2. Find Current Gate

Read `.claude-tempo/plan-state.json` or Linear issue for active gate.

Gates in ct-plan workflow:
- Design Review (after spec)
- Implementation Review (after PRs)
- Final Review (before merge)

### 3. Record Approval

Update gate status:

**Before:**
```markdown
## [GATE] Design Review

| Team Member | Status |
|-------------|--------|
| Jonathan    | ⏳ Pending |
| Erik        | ⏳ Pending |
```

**After your approval:**
```markdown
## [GATE] Design Review

| Team Member | Status |
|-------------|--------|
| Jonathan    | ✅ Approved (2:30 PM) |
| Erik        | ⏳ Pending |
```

### 4. Check Gate Completion

Gate passes when ALL required approvers have approved.

**If gate incomplete:**
```
✅ Your approval recorded for BOLT-456

Gate: Design Review
Your status: ✅ Approved

Still waiting for:
  • Erik ⏳

Gate will pass when all team members approve.
```

**If gate complete:**
```
✅ Gate passed! All approvals received.

Gate: Design Review ✅
  • Jonathan ✅ (2:30 PM)
  • Erik ✅ (2:45 PM)

Proceeding to: Implementation

Next: /ct-feature start BOLT-456
```

### 5. Trigger Next Phase

| Gate Passed | Next Action |
|-------------|-------------|
| Design Review | Suggest `/ct-feature start` |
| Implementation Review | Suggest `/ct-review` or merge |
| Final Review | Merge PRs, close Linear |

## Already Approved

If you've already approved:

```
ℹ️ You've already approved this gate.

Gate: Design Review
Your status: ✅ Approved (2:30 PM)

Still waiting for:
  • Erik ⏳
```

## Force Approval

Override team requirement (use sparingly):

```
/ct-approve BOLT-456 --force
```

```
⚠️ Force approved by Jonathan

Gate: Design Review
Normal requirement: 2 approvals
Received: 1 approval

Proceeding with override. Logged for audit.
Reason: [prompted for reason]
```

## State Updates

Updates `.claude-tempo/plan-state.json`:

```json
{
  "team_approvals": {
    "required": ["Jonathan", "Erik"],
    "received": [
      {"name": "Jonathan", "at": "2026-01-30T14:30:00Z"}
    ]
  },
  "current_phase": "gate",
  "gate_status": "partial"
}
```

When complete:
```json
{
  "team_approvals": {
    "required": ["Jonathan", "Erik"],
    "received": [
      {"name": "Jonathan", "at": "2026-01-30T14:30:00Z"},
      {"name": "Erik", "at": "2026-01-30T14:45:00Z"}
    ]
  },
  "current_phase": "complete",
  "gate_status": "passed"
}
```
