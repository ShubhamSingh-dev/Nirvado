import { type NextRequest, NextResponse } from "next/server";

interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

interface EnhancePromptRequest {
  action: "enhance";
  prompt: string;
  context?: {
    fileName?: string;
    language?: string;
    codeContent?: string;
  };
}

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = "llama-3.1-8b-instant"; // Fast & free — good for code tasks
// Other options:
// "llama-3.3-70b-versatile"  → slower but smarter, better for complex code reviews
// "moonshotai/kimi-k2-instruct" → great for coding tasks

async function callGroq(
  messages: ChatMessage[],
  options: { temperature?: number; max_tokens?: number } = {}
): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    throw new Error("GROQ_API_KEY is not set in environment variables");
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 20000); // 20s timeout

  try {
    const response = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages,
        temperature: options.temperature ?? 0.7,
        max_tokens: options.max_tokens ?? 1024,
        top_p: 0.9,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Groq API error:", errorText);
      throw new Error(`Groq API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No response content from Groq");
    }

    return content.trim();
  } catch (error) {
    clearTimeout(timeoutId);
    if ((error as Error).name === "AbortError") {
      throw new Error("Request timeout: Groq took too long to respond");
    }
    throw error;
  }
}

async function generateAIResponse(messages: ChatMessage[]): Promise<string> {
  const systemMessage: ChatMessage = {
    role: "system",
    content: `You are an expert AI coding assistant. You help developers with:
- Code explanations and debugging
- Best practices and architecture advice
- Writing clean, efficient code
- Troubleshooting errors
- Code reviews and optimizations

Always provide clear, practical answers. When showing code, use proper formatting with language-specific syntax.
Keep responses concise but comprehensive. Use code blocks with language specification when providing code examples.`,
  };

  return callGroq([systemMessage, ...messages], {
    temperature: 0.7,
    max_tokens: 1024,
  });
}

async function enhancePrompt(request: EnhancePromptRequest): Promise<string> {
  const messages: ChatMessage[] = [
    {
      role: "system",
      content:
        "You are a prompt enhancement assistant. Return only the enhanced prompt — no explanations, no preamble.",
    },
    {
      role: "user",
      content: `Enhance this prompt to be more specific and effective for a coding AI assistant.

Original prompt: "${request.prompt}"

Context: ${
        request.context
          ? JSON.stringify(request.context, null, 2)
          : "No additional context"
      }

Enhanced prompt should:
- Be more specific and detailed
- Include relevant technical context
- Ask for specific examples or explanations
- Be clear about expected output format
- Maintain the original intent

Return only the enhanced prompt, nothing else.`,
    },
  ];

  try {
    return await callGroq(messages, { temperature: 0.3, max_tokens: 500 });
  } catch (error) {
    console.error("Prompt enhancement error:", error);
    return request.prompt; // Fallback to original prompt if enhancement fails
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Handle prompt enhancement
    if (body.action === "enhance") {
      const enhancedPrompt = await enhancePrompt(body as EnhancePromptRequest);
      return NextResponse.json({ enhancedPrompt });
    }

    const { message, history } = body;

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Message is required and must be a string" },
        { status: 400 }
      );
    }

    // Validate and sanitize history
    const validHistory: ChatMessage[] = Array.isArray(history)
      ? history
          .filter(
            (msg: any) =>
              msg &&
              typeof msg === "object" &&
              typeof msg.role === "string" &&
              typeof msg.content === "string" &&
              ["user", "assistant"].includes(msg.role)
          )
          .slice(-10) // Keep last 10 messages for context window
      : [];

    const messages: ChatMessage[] = [
      ...validHistory,
      { role: "user", content: message },
    ];

    const aiResponse = await generateAIResponse(messages);

    return NextResponse.json({
      response: aiResponse,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error in AI chat route:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";

    return NextResponse.json(
      {
        error: "Failed to generate AI response",
        details: errorMessage,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    status: "AI Chat API is running (powered by Groq)",
    model: GROQ_MODEL,
    timestamp: new Date().toISOString(),
    info: "Use POST method to send chat messages or enhance prompts",
  });
}