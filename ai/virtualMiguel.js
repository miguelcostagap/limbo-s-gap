import { callChatCompletions } from "./gptClient.js";
import { buildRouterPrompt } from "./routerPrompt.js";
import { buildPersonaPrompt } from "./personaPrompt.js";
import { getCatalog, getNodesByIds } from "./neuralMap.js";

export function createVirtualMiguel({ endpointUrl, model }) {
  const history = [];

  async function route(userText) {
    const res = await callChatCompletions({
      endpointUrl,
      model,
      messages: [
        { role: "system", content: buildRouterPrompt() },
        { role: "user", content: JSON.stringify({ userPrompt: userText, nodes: getCatalog() }) }
      ],
      response_format: { type: "json_object" }
    });

    return Array.isArray(res.nodeIds) ? res.nodeIds : [];
  }

  async function answer(userText, nodeIds) {
    const selected = nodeIds.length ? getNodesByIds(nodeIds) : getNodesByIds(["identity.core"]);

    const res = await callChatCompletions({
      endpointUrl,
      model,
      messages: [
        { role: "system", content: buildPersonaPrompt() },
        ...history.slice(-8),
        { role: "user", content: JSON.stringify({ userPrompt: userText, selectedNodes: selected }) }
      ],
      response_format: { type: "json_object" }
    });

    const text = Array.isArray(res.answerSentences)
      ? res.answerSentences.join(" ")
      : "";

    history.push({ role: "user", content: userText });
    history.push({ role: "assistant", content: text });

    return res;
  }

  async function ask(userText) {
    const ids = await route(userText);
    return answer(userText, ids);
  }

  return { ask };
}
