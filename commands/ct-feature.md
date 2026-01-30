---
description: Multi-repo feature coordination for tempo + tempo-client
aliases: [feature, ctfeature]
---

# ct-feature Command

Coordinate features across tempo (backend) and tempo-client (frontend).

## Usage

```
/ct-feature start BOLT-456 "Settlement payments"
/ct-feature api          # Work on backend
/ct-feature ui           # Work on frontend
/ct-feature sync         # Check API ↔ client alignment
/ct-feature status       # View progress
/ct-feature pr           # Create linked PRs
```

## Subcommands

### start

Initialize a feature across both repos.

```
/ct-feature start BOLT-456 "Settlement payments"
```

**What it does:**
1. Creates feature branch in tempo: `feature/BOLT-456-settlement-payments`
2. Creates feature branch in tempo-client: `feature/BOLT-456-settlement-payments`
3. Creates shared context file: `.claude-tempo/features/BOLT-456.md`
4. Links to Linear issue
5. Updates state

**State created:**
```json
{
  "feature_id": "BOLT-456",
  "name": "Settlement payments",
  "branches": {
    "tempo": "feature/BOLT-456-settlement-payments",
    "tempo-client": "feature/BOLT-456-settlement-payments"
  },
  "status": {
    "api": "not_started",
    "ui": "not_started"
  },
  "prs": {
    "tempo": null,
    "tempo-client": null
  }
}
```

### api

Focus Claude Code on backend work.

```
/ct-feature api
```

**What it does:**
1. Changes directory to tempo repo
2. Checks out feature branch
3. Loads backend context (Laravel patterns, existing code)
4. Invokes **Backend Engineer** agent context
5. Updates status to "in_progress"

**Context loaded:**
- Feature spec from `.claude-tempo/features/BOLT-456.md`
- Backend patterns from `references/backend-patterns.md`
- Relevant existing files

### ui

Focus Claude Code on frontend work.

```
/ct-feature ui
```

**What it does:**
1. Changes directory to tempo-client repo
2. Checks out feature branch
3. Loads frontend context (Vue patterns, components)
4. Invokes **Frontend Engineer** agent context
5. Updates status to "in_progress"

**Context loaded:**
- Feature spec
- Frontend patterns from `references/frontend-patterns.md`
- Relevant existing components

### sync

Verify API and client are aligned.

```
/ct-feature sync
```

**Checks:**
1. **Endpoints exist:** API routes defined for all client service calls
2. **Types match:** TypeScript interfaces match API Resource output
3. **No orphans:** No client calls to non-existent endpoints
4. **No unused:** No API endpoints without client consumers

**Output:**
```
Sync Check: BOLT-456

✅ Endpoints
   POST /api/settlements → settlementService.create()
   GET /api/settlements/{id} → settlementService.get()
   POST /api/settlements/{id}/approve → settlementService.approve()

✅ Types
   Settlement interface matches SettlementResource

⚠️ Issues
   - settlementService.bulkApprove() calls non-existent endpoint
   - SettlementResource.approved_by not in TypeScript interface

Run /ct-feature fix to generate fixes.
```

### status

View feature progress across repos.

```
/ct-feature status
```

**Output:**
```
Feature: BOLT-456 "Settlement payments"

Repos:
  tempo         │ feature/BOLT-456... │ 3 commits │ PR #123
  tempo-client  │ feature/BOLT-456... │ 2 commits │ No PR

API Status: ✅ Complete
  - SettlementController ✅
  - SettlementService ✅
  - SettlementResource ✅

UI Status: 🔄 In Progress
  - SettlementList.vue ✅
  - SettlementDetail.vue 🔄
  - useSettlements.ts ✅

Sync: ⚠️ 1 issue (run /ct-feature sync)

Next: Complete UI, then /ct-feature pr
```

### pr

Create linked pull requests.

```
/ct-feature pr
```

**What it does:**
1. Creates PR in tempo (if changes exist)
2. Creates PR in tempo-client (if changes exist)
3. Links PRs in descriptions
4. Links to Linear issue
5. Adds reviewers (Erik/Jonathan)

**PR Description (auto-generated):**
```markdown
## Summary
Settlement payments feature implementation.

## Linear
BOLT-456

## Related PRs
- tempo-client: #456

## Changes
- Added SettlementController with CRUD + approve
- Added SettlementService for business logic
- Added SettlementResource for API transformation

## Testing
- [ ] Feature tests pass
- [ ] Manual testing in staging
```

## Shared Context File

`.claude-tempo/features/BOLT-456.md`:

```markdown
# Feature: BOLT-456 Settlement Payments

## Spec
[Link to or embed product spec]

## API Contract

### Endpoints
| Method | Path | Request | Response |
|--------|------|---------|----------|
| GET | /api/settlements | - | Settlement[] |
| POST | /api/settlements | CreateDTO | Settlement |
| POST | /api/settlements/{id}/approve | - | Settlement |

### Types
```typescript
interface Settlement {
  id: string
  carrier_id: string
  amount: number
  status: 'draft' | 'pending' | 'approved'
  // ...
}
```

## Progress

### Backend (tempo)
- [x] Migration
- [x] Model
- [x] Service
- [x] Controller
- [x] Resource
- [x] Tests

### Frontend (tempo-client)
- [x] Types
- [x] Service
- [x] Composable
- [ ] List view
- [ ] Detail view
- [ ] Tests

## Notes
[Running notes during implementation]
```

## Configuration

Requires workspace config in `~/.claude-tempo/config.json`:

```json
{
  "repos": {
    "tempo": {
      "path": "~/Developer/Herd/tempo",
      "type": "backend"
    },
    "tempo-client": {
      "path": "~/Developer/Work/tempo-client",
      "type": "frontend"
    }
  }
}
```
