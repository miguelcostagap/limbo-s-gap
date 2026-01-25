// ai/virtualMiguel.js
import { callChatCompletions } from "./gptClient.js";
import { buildSystemPrompt } from "./personaPrompt.js";

function safeArray(v) {
  return Array.isArray(v) ? v : [];
}

export function createVirtualMiguel({ endpointUrl, model, warmupEnabled } = {}) {
  const state = {
    prepared: false,
    messages: []
  };

  async function prepare() {
    if (state.prepared) return;

    state.messages.push({ role: "system", content: buildSystemPrompt() });

    if (warmupEnabled) {
      // Very small warm-up call: costs tokens, but reinforces the "session" feel.
      // We do not keep the warm-up answer; we just prove the pipeline is alive.
      try {
        await callChatCompletions({
          endpointUrl,
          model,
          messages: [...state.messages, { role: "user", content: "Return {\"answerSentences\":[\"READY\"]}." }],
          response_format: { type: "json_object" }
        });
      } catch {
        // Ignore warm-up errors; main calls will still be attempted.
      }
    }

    state.prepared = true;
  }

  async function ask(userText) {
    await prepare();

    const content = String(userText || "").trim();
    if (!content) {
      return { mappedNodeIds: [], answerSentences: ["..."] };
    }

    state.messages.push({ role: "user", content });

    const json = await callChatCompletions({
      endpointUrl,
      model,
      messages: state.messages,
      response_format: { type: "json_object" }
    });

    // Persist a compact assistant turn for coherence (not the raw JSON).
    const assistantText = safeArray(json?.answerSentences).join(" ").trim() || "";
    state.messages.push({ role: "assistant", content: assistantText });

    return {
      mappedNodeIds: safeArray(json?.mappedNodeIds),
      answerSentences: safeArray(json?.answerSentences)
    };
  }

  return { prepare, ask };
}
