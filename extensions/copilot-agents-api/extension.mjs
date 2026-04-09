// Extension: copilot-agents-api
// Query the Copilot Agents API for session and task details and events.
//
// Requires the GitHub CLI (gh) to be installed and authenticated.
// Install as a user extension so it works across all repositories:
//   ~/.copilot/extensions/copilot-agents-api/extension.mjs

import { execFile } from "node:child_process";
import { joinSession } from "@github/copilot-sdk/extension";

function run(cmd, args) {
    return new Promise((resolve, reject) => {
        execFile(cmd, args, (err, stdout, stderr) => {
            if (err) reject(new Error(stderr || err.message));
            else resolve(stdout.trim());
        });
    });
}

let apiBase;

async function getApiBase() {
    if (!apiBase) {
        const result = await run("gh", ["api", "/copilot_internal/user", "--jq", ".endpoints.api"]);
        if (!result || !result.startsWith("http")) {
            throw new Error(`Unexpected API base URL: ${result}`);
        }
        apiBase = result;
    }
    return apiBase;
}

async function callAgentsApi(path) {
    const [base, token] = await Promise.all([
        getApiBase(),
        run("gh", ["auth", "token"]),
    ]);
    const res = await fetch(`${base}${path}`, {
        headers: {
            "Authorization": `Bearer ${token}`,
            "X-GitHub-Api-Version": "2025-05-01",
            "Copilot-Integration-Id": "copilot-4-cli",
            "Accept": "application/json",
        },
    });
    const body = await res.text();
    if (!res.ok) {
        return {
            textResultForLlm: `Error ${res.status} ${res.statusText}\n${body}`,
            resultType: "failure",
        };
    }
    // Return the raw JSON response exactly as returned by the API
    return JSON.stringify(JSON.parse(body), null, 2);
}

await joinSession({
    tools: [
        {
            name: "copilot_agents_api_get",
            description:
                "Query the Copilot Agents API. Fetch details or events for a session or task by ID. " +
                "Returns the raw JSON response from the API.",
            parameters: {
                type: "object",
                properties: {
                    resource_type: {
                        type: "string",
                        enum: ["session", "task"],
                        description: "Type of resource to query.",
                    },
                    resource_id: {
                        type: "string",
                        description: "The session ID or task ID.",
                    },
                    events: {
                        type: "boolean",
                        description:
                            "When true, fetch the event log for the resource instead of its details.",
                    },
                },
                required: ["resource_type", "resource_id"],
            },
            skipPermission: true,
            handler: async (args) => {
                const plural = args.resource_type === "session" ? "sessions" : "tasks";
                const suffix = args.events ? "/events" : "";
                return callAgentsApi(`/agents/${plural}/${args.resource_id}${suffix}`);
            },
        },
    ],
});
