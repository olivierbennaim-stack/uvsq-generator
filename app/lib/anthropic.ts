const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const API_URL = "https://api.anthropic.com/v1/messages";

interface AnthropicMessage {
  role: "user" | "assistant";
  content: string;
}

interface AnthropicRequestOptions {
  system: string;
  messages: AnthropicMessage[];
  useWebSearch?: boolean;
  maxTokens?: number;
}

export async function callAnthropic(options: AnthropicRequestOptions): Promise<string> {
  const { system, messages, useWebSearch = false, maxTokens = 4096 } = options;

  if (!ANTHROPIC_API_KEY) {
    throw new Error("ANTHROPIC_API_KEY is not set");
  }

  const body: Record<string, unknown> = {
    model: "claude-sonnet-4-20250514",
    max_tokens: maxTokens,
    system,
    messages,
  };

  if (useWebSearch) {
    body.tools = [
      {
        type: "web_search_20250305",
        name: "web_search",
      },
    ];
  }

  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(90000),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Anthropic API error ${response.status}: ${errorText}`);
  }

  const data = await response.json();

  const textBlocks = data.content.filter(
    (block: { type: string }) => block.type === "text"
  );
  const fullText = textBlocks.map((block: { text: string }) => block.text).join("\n");

  if (!fullText.trim()) {
    throw new Error("Empty response from Anthropic API");
  }

  return fullText.trim();
}
