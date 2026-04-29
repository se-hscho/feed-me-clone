export type PromptMode = "summary" | "translate-ko" | "explain-simple" | "custom" | "none"

export type PromptSelection = {
  mode: PromptMode
  customPrompt?: string
}

const PROMPTS: Record<Exclude<PromptMode, "custom" | "none">, string> = {
  summary: "요약해줘",
  "translate-ko": "한국어로 번역해줘",
  "explain-simple": "쉽게 설명해줘",
}

export function buildLlmQuery(markdown: string, selection: PromptSelection) {
  if (selection.mode === "custom") {
    const prompt = selection.customPrompt?.trim()
    return prompt ? `${prompt}\n\n${markdown}` : markdown
  }

  if (selection.mode === "none") {
    return markdown
  }

  return `${PROMPTS[selection.mode]}\n\n${markdown}`
}

export function buildLlmUrl(provider: "chatgpt" | "claude", query: string) {
  const base =
    provider === "chatgpt" ? "https://chatgpt.com/?q=" : "https://claude.ai/new?q="

  return `${base}${encodeURIComponent(query)}`
}
