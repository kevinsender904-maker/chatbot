import { Message } from "../types";
import { handleApiError } from "../utils/errorHandler";

export async function sendMessageToGemini(
  messages: { role: string; content: string }[],
  onProgress: (chunk: string) => void,
  onError: (error: string) => void,
  profile?: { language?: string; age_range?: string; name?: string }
) {
  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ messages, profile }),
    });

    if (!response.ok) {
      throw new Error("Failed to connect to the server.");
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder("utf-8");
    let done = false;

    if (!reader) throw new Error("No reader stream available.");

    while (!done) {
      const { value, done: readerDone } = await reader.read();
      done = readerDone;
      if (value) {
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n\n");
        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const dataStr = line.slice(6);
            if (dataStr === "[DONE]") {
              done = true;
              break;
            }
            try {
              const parsed = JSON.parse(dataStr);
              if (parsed.error) {
                onError(parsed.error);
                return;
              }
              if (parsed.text) {
                onProgress(parsed.text);
              }
            } catch (e) {
              console.error("Error parsing JSON:", e);
            }
          }
        }
      }
    }
  } catch (error: any) {
    console.error("API error:", error);
    onError(handleApiError(error));
  }
}
