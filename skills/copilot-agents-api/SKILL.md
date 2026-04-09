---
name: copilot-agents-api
description: Query the Copilot Agents API to fetch details and events for agent tasks and sessions by ID. Use when the user references a session ID or task ID and wants to inspect its state or event log.
---

# Copilot Agents API

Use this skill to fetch details or events for Copilot agent tasks and sessions.

## Preferred: Use the extension tool

If the `copilot_agents_api_get` tool is available, use it directly:

```
copilot_agents_api_get({ resource_type: "session", resource_id: "<SESSION_ID>" })
copilot_agents_api_get({ resource_type: "session", resource_id: "<SESSION_ID>", events: true })
copilot_agents_api_get({ resource_type: "task", resource_id: "<TASK_ID>" })
copilot_agents_api_get({ resource_type: "task", resource_id: "<TASK_ID>", events: true })
```

## Fallback: Use curl via bash

If the tool is not available, use these curl commands instead. They use `gh` CLI for authentication and API base URL discovery.

### Get session details

```bash
curl -s "$(gh api /copilot_internal/user --jq '.endpoints.api')/agents/sessions/{session_id}" \
  -H "Authorization: Bearer $(gh auth token)" \
  -H "X-GitHub-Api-Version: 2025-05-01" \
  -H "Copilot-Integration-Id: copilot-4-cli" \
  -H "Accept: application/json" | jq .
```

### Get session events

```bash
curl -s "$(gh api /copilot_internal/user --jq '.endpoints.api')/agents/sessions/{session_id}/events" \
  -H "Authorization: Bearer $(gh auth token)" \
  -H "X-GitHub-Api-Version: 2025-05-01" \
  -H "Copilot-Integration-Id: copilot-4-cli" \
  -H "Accept: application/json" | jq .
```

### Get task details

```bash
curl -s "$(gh api /copilot_internal/user --jq '.endpoints.api')/agents/tasks/{task_id}" \
  -H "Authorization: Bearer $(gh auth token)" \
  -H "X-GitHub-Api-Version: 2025-05-01" \
  -H "Copilot-Integration-Id: copilot-4-cli" \
  -H "Accept: application/json" | jq .
```

### Get task events

```bash
curl -s "$(gh api /copilot_internal/user --jq '.endpoints.api')/agents/tasks/{task_id}/events" \
  -H "Authorization: Bearer $(gh auth token)" \
  -H "X-GitHub-Api-Version: 2025-05-01" \
  -H "Copilot-Integration-Id: copilot-4-cli" \
  -H "Accept: application/json" | jq .
```

## Notes

- Replace `{session_id}` and `{task_id}` with actual IDs.
- Requires the GitHub CLI (`gh`) to be installed and authenticated.
- The API base URL is dynamically resolved from `gh api /copilot_internal/user` (typically `https://api.githubcopilot.com` or `https://api.enterprise.githubcopilot.com`).
- Return the raw JSON response to the user — the structure is important for clients consuming the API.
