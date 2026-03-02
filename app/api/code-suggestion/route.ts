import { type NextRequest, NextResponse } from "next/server";

interface CodeSuggestionRequest {
  fileContent: string;
  cursorLine: number;
  cursorColumn: number;
  suggestionType: string;
  fileName?: string;
}

interface CodeContext {
  language: string;
  framework: string;
  beforeContext: string;
  currentLine: string;
  afterContext: string;
  cursorPosition: { line: number; column: number };
  isInFunction: boolean;
  isInClass: boolean;
  isAfterComment: boolean;
  incompletePatterns: string[];
}

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
// Using the versatile model here for better code suggestions quality
// You can switch to "llama-3.1-8b-instant" if you want faster but lighter suggestions
const GROQ_MODEL = "llama-3.3-70b-versatile";

async function callGroq(
  systemPrompt: string,
  userPrompt: string,
  options: { temperature?: number; max_tokens?: number } = {}
): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    throw new Error("GROQ_API_KEY is not set in environment variables");
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 20000);

  try {
    const response = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: options.temperature ?? 0.2, // Low temperature = more deterministic code
        max_tokens: options.max_tokens ?? 300,
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
      throw new Error("No content in Groq response");
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

export async function POST(request: NextRequest) {
  try {
    const body: CodeSuggestionRequest = await request.json();
    const { fileContent, cursorLine, cursorColumn, suggestionType, fileName } =
      body;

    // Validate input
    if (!fileContent || cursorLine < 0 || cursorColumn < 0 || !suggestionType) {
      return NextResponse.json(
        { error: "Invalid input parameters" },
        { status: 400 }
      );
    }

    // Analyze code context
    const context = analyzeCodeContext(
      fileContent,
      cursorLine,
      cursorColumn,
      fileName
    );

    // Build AI prompt
    const { systemPrompt, userPrompt } = buildPrompt(context, suggestionType);

    // Call Groq
    const rawSuggestion = await generateSuggestion(systemPrompt, userPrompt);

    return NextResponse.json({
      suggestion: rawSuggestion,
      context,
      metadata: {
        language: context.language,
        framework: context.framework,
        position: context.cursorPosition,
        model: GROQ_MODEL,
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    console.error("Code suggestion error:", error);
    return NextResponse.json(
      { error: "Internal server error", message: error.message },
      { status: 500 }
    );
  }
}

/**
 * Analyze the code context around the cursor position
 */
function analyzeCodeContext(
  content: string,
  line: number,
  column: number,
  fileName?: string
): CodeContext {
  const lines = content.split("\n");
  const currentLine = lines[line] || "";

  // Get surrounding context (10 lines before and after)
  const contextRadius = 10;
  const startLine = Math.max(0, line - contextRadius);
  const endLine = Math.min(lines.length, line + contextRadius);

  const beforeContext = lines.slice(startLine, line).join("\n");
  const afterContext = lines.slice(line + 1, endLine).join("\n");

  // Detect language and framework
  const language = detectLanguage(content, fileName);
  const framework = detectFramework(content);

  // Analyze code patterns
  const isInFunction = detectInFunction(lines, line);
  const isInClass = detectInClass(lines, line);
  const isAfterComment = detectAfterComment(currentLine, column);
  const incompletePatterns = detectIncompletePatterns(currentLine, column);

  return {
    language,
    framework,
    beforeContext,
    currentLine,
    afterContext,
    cursorPosition: { line, column },
    isInFunction,
    isInClass,
    isAfterComment,
    incompletePatterns,
  };
}

/**
 * Build system + user prompts separately for better Groq results
 */
function buildPrompt(
  context: CodeContext,
  suggestionType: string
): { systemPrompt: string; userPrompt: string } {
  const systemPrompt = `You are an expert code completion engine for a code editor.

Rules you must follow:
- Output ONLY the raw code to be inserted at the cursor — nothing else
- No explanations, no markdown, no code fences, no comments unless part of the suggestion
- Maintain the existing indentation style
- Follow ${context.language} best practices
- Keep suggestions concise and focused`;

  const userPrompt = `Generate a ${suggestionType} code completion for the cursor position marked as |CURSOR|.

Language: ${context.language}
Framework: ${context.framework}
In Function: ${context.isInFunction}
In Class: ${context.isInClass}
After Comment: ${context.isAfterComment}
Incomplete Patterns: ${context.incompletePatterns.join(", ") || "None"}

Code context:
\`\`\`${context.language.toLowerCase()}
${context.beforeContext}
${context.currentLine.substring(0, context.cursorPosition.column)}|CURSOR|${context.currentLine.substring(context.cursorPosition.column)}
${context.afterContext}
\`\`\`

Output only the code to insert at |CURSOR|. No explanation.`;

  return { systemPrompt, userPrompt };
}

/**
 * Generate suggestion using Groq and clean up the response
 */
async function generateSuggestion(
  systemPrompt: string,
  userPrompt: string
): Promise<string> {
  try {
    let suggestion = await callGroq(systemPrompt, userPrompt, {
      temperature: 0.2, // Low = more predictable code completions
      max_tokens: 300,
    });

    // Strip any code fences the model might still include
    if (suggestion.includes("```")) {
      const codeMatch = suggestion.match(/```[\w]*\n?([\s\S]*?)```/);
      suggestion = codeMatch ? codeMatch[1].trim() : suggestion;
    }

    // Remove any leftover cursor markers
    suggestion = suggestion.replace(/\|CURSOR\|/g, "").trim();

    return suggestion;
  } catch (error) {
    console.error("AI generation error:", error);
    return ""; // Return empty string so editor stays clean rather than showing error comment
  }
}

// ─── Helper functions for code analysis (unchanged) ──────────────────────────

function detectLanguage(content: string, fileName?: string): string {
  if (fileName) {
    const ext = fileName.split(".").pop()?.toLowerCase();
    const extMap: Record<string, string> = {
      ts: "TypeScript",
      tsx: "TypeScript",
      js: "JavaScript",
      jsx: "JavaScript",
      py: "Python",
      java: "Java",
      go: "Go",
      rs: "Rust",
      php: "PHP",
    };
    if (ext && extMap[ext]) return extMap[ext];
  }

  if (content.includes("interface ") || content.includes(": string"))
    return "TypeScript";
  if (content.includes("def ") || content.includes("import ")) return "Python";
  if (content.includes("func ") || content.includes("package ")) return "Go";

  return "JavaScript";
}

function detectFramework(content: string): string {
  if (content.includes("import React") || content.includes("useState"))
    return "React";
  if (content.includes("import Vue") || content.includes("<template>"))
    return "Vue";
  if (content.includes("@angular/") || content.includes("@Component"))
    return "Angular";
  if (content.includes("next/") || content.includes("getServerSideProps"))
    return "Next.js";

  return "None";
}

function detectInFunction(lines: string[], currentLine: number): boolean {
  for (let i = currentLine - 1; i >= 0; i--) {
    const line = lines[i];
    if (line?.match(/^\s*(function|def|const\s+\w+\s*=|let\s+\w+\s*=)/))
      return true;
    if (line?.match(/^\s*}/)) break;
  }
  return false;
}

function detectInClass(lines: string[], currentLine: number): boolean {
  for (let i = currentLine - 1; i >= 0; i--) {
    const line = lines[i];
    if (line?.match(/^\s*(class|interface)\s+/)) return true;
  }
  return false;
}

function detectAfterComment(line: string, column: number): boolean {
  const beforeCursor = line.substring(0, column);
  return /\/\/.*$/.test(beforeCursor) || /#.*$/.test(beforeCursor);
}

function detectIncompletePatterns(line: string, column: number): string[] {
  const beforeCursor = line.substring(0, column);
  const patterns: string[] = [];

  if (/^\s*(if|while|for)\s*\($/.test(beforeCursor.trim()))
    patterns.push("conditional");
  if (/^\s*(function|def)\s*$/.test(beforeCursor.trim()))
    patterns.push("function");
  if (/\{\s*$/.test(beforeCursor)) patterns.push("object");
  if (/\[\s*$/.test(beforeCursor)) patterns.push("array");
  if (/=\s*$/.test(beforeCursor)) patterns.push("assignment");
  if (/\.\s*$/.test(beforeCursor)) patterns.push("method-call");

  return patterns;
}