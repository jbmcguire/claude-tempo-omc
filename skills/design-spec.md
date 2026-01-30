---
name: design-spec
description: Create a comprehensive PRODUCT feature design spec. Use when planning new features. Produces user stories, acceptance criteria, and definition of done.
---

# design-spec

Create a PRODUCT-LEVEL feature design specification.

## What This Creates

- User stories in "As a [persona], I can [action] so that [benefit]" format
- Concrete, testable Definition of Done items
- Edge cases described as user-facing behaviors
- Permissions as business rules

## ABSOLUTE RULES — PRODUCT SPEC ONLY

### NEVER INCLUDE:
- Database tables, schemas, or migrations
- API endpoints, routes, or HTTP methods
- Code, classes, models, or controllers
- Technical architecture or system design
- Implementation details of ANY kind

### ALWAYS INCLUDE:
- What users can DO (capabilities)
- User stories with persona, action, and benefit
- Definition of Done with specific, testable criteria
- Edge cases as user-facing behaviors
- Permissions as business rules

## Output Format

```markdown
# Feature Spec: [Feature Name]

## Overview
[2-3 sentences describing the feature from user perspective]

## Problem Statement
[What pain points this solves for users]

## Goals
1. [Measurable outcome 1]
2. [Measurable outcome 2]
3. [Measurable outcome 3]

## Users & Personas

| Persona | Role | Key Needs |
|---------|------|-----------|
| [Persona] | [Role] | [What they need from this feature] |

## Feature Requirements

### Capability 1: [Name]

**User Stories:**
- As a [persona], I can [action] so that [benefit]
- As a [persona], I can [action] so that [benefit]

**Abilities:**
- User can [specific action]
- User can [specific action]

**Definition of Done:**
- [ ] [Specific, testable criterion]
- [ ] [Specific, testable criterion]
- [ ] [Specific, testable criterion]

### Capability 2: [Name]
[Same structure as above]

## User Flows

### Flow 1: [Name]
1. User navigates to [location]
2. User sees [what]
3. User clicks [action]
4. System shows [result]
5. User confirms [action]

## Permissions & Access Control

| Action | [Persona 1] | [Persona 2] | Admin |
|--------|-------------|-------------|-------|
| [Action] | ✓ Own | ✓ Own | ✓ All |
| [Action] | ✗ | ✗ | ✓ |

## Edge Cases & Error States

| Scenario | Expected Behavior |
|----------|-------------------|
| [Edge case] | [What user sees/experiences] |
| [Error state] | [How system responds] |

## Out of Scope (v1)
- [Explicit exclusion 1]
- [Explicit exclusion 2]

## Success Metrics
- [Metric 1]: [Target]
- [Metric 2]: [Target]

## Open Questions
- [Question needing clarification]

## Future Enhancements
- [v2 idea 1]
- [v2 idea 2]
```

## Usage

### Standalone
Invoke directly when you need a product spec:
```
/design-spec "Settlement payments for carriers"
```

### In Planning Workflow
Called automatically by `/ct-plan` during the Planner phase. The Critic agent will review and iterate on the spec until it meets quality standards.

## Quality Checklist

Before considering a spec complete, verify:

- [ ] Every user story has persona + action + benefit
- [ ] Every DoD item is testable (can write a test case)
- [ ] No technical/implementation language leaked in
- [ ] Edge cases cover error states and boundary conditions
- [ ] Permissions table is complete for all personas
- [ ] Out of scope clearly excludes v2 work
- [ ] Open questions are actual blockers (not rhetorical)

## Tempo-Specific Guidance

When writing specs for Tempo:
- Consider both dispatcher and carrier personas
- Think about bulk operations (carriers handle many items)
- Account for mobile responsiveness in UI flows
- Reference existing UI patterns when describing interactions
- Consider audit trail needs for financial features
