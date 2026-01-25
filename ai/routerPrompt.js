export function buildRouterPrompt() {
  return `
You are a topic classifier.

Given a user message and a list of nodes (id, title, subtitle, tags),
return ONLY this JSON:

{ "nodeIds": ["..."] }

Select up to 6 node IDs that best match the user's intent.
If none match, return an empty array.

No explanations.
`.trim();
}
