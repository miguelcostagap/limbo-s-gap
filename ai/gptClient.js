export async function callChatCompletions({ endpointUrl, model, messages, response_format }) {
  if (!endpointUrl) {
    throw new Error("gptClient: endpointUrl is missing");
  }

  const res = await fetch(endpointUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      messages,
      response_format: response_format || { type: "json_object" }
    })
  });

  const text = await res.text().catch(() => "");
  if (!res.ok) {
    throw new Error(`GPT proxy error (${res.status}): ${text}`);
  }

  let data;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error("GPT proxy returned non-JSON response");
  }

  const content = data?.choices?.[0]?.message?.content;
  if (typeof content !== "string") {
    throw new Error("Invalid GPT response shape (missing message.content)");
  }

  // We request JSON output, but the API returns it as a string in content.
  try {
    return JSON.parse(content);
  } catch {
    throw new Error("GPT content was not valid JSON");
  }
}
