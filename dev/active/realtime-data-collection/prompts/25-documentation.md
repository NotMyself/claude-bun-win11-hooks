# Feature: F028 - Documentation

## Context
See `context.md`. Final step: update project documentation.

## Prior Work
F000-F027 completed (entire system implemented and tested)

## Objective
Update CLAUDE.md to reflect new metrics architecture.

> **Scope Constraint**: Only update documentation. Do not modify implementation.

## Relevant Decisions
- **D010**: UI visualization deferred — Note in docs that charts/dashboards are future work

## Files to Update
- `CLAUDE.md`

## Implementation

Update CLAUDE.md sections:

### Project Overview
Update description to mention metrics-first architecture.

### Architecture
Replace old diagram with new metrics system architecture from plan.

### Implemented Features
Update table with new files and purposes:
- metrics/ subsystem
- New hook handlers
- New viewer with API endpoints
- SSE streaming

### Dependencies
Confirm no new npm dependencies (using Bun built-ins).

### Data Collection
Add new section explaining:
- MetricEntry structure
- Token/cost tracking
- Plan orchestration events
- Time-window aggregations

### API Endpoints
Document all REST and SSE endpoints.

### Configuration
Document METRICS_CONFIG and VIEWER_CONFIG.

### Testing
Mention comprehensive test coverage.

## Acceptance Criteria
- [ ] CLAUDE.md accurately reflects new architecture
- [ ] All new files documented
- [ ] API endpoints documented
- [ ] Configuration documented
- [ ] Note about deferred UI visualization

## Verification
```bash
cat CLAUDE.md  # Review for accuracy
```

## Commit
```bash
git add CLAUDE.md
git commit -m "docs: update CLAUDE.md for new metrics system

Implements: F028
Decisions: D010

- Document new metrics-first architecture
- List all new files and their purposes
- Document API endpoints and configuration
- Note that UI visualization is deferred to future work
- Update dependency list (no new npm packages)"
```

## Next
**Implementation complete!** All features (F000-F028) are now done.

The new realtime data collection system is ready for deployment.
