import {
  buildLlmQuery,
  buildLlmUrl,
  isLlmQueryTooLong,
  MAX_LLM_QUERY_LENGTH,
} from "@/lib/url-to-markdown/llm-handoff"

describe("llm handoff helpers", () => {
  it("returns markdown as-is when no prompt is selected", () => {
    expect(buildLlmQuery("# Title", { mode: "none" })).toBe("# Title")
  })

  it("prepends a preset prompt before the markdown", () => {
    expect(buildLlmQuery("# Title", { mode: "summary" })).toBe("요약해줘\n\n# Title")
  })

  it("prepends a custom prompt before the markdown", () => {
    expect(
      buildLlmQuery("# Title", { mode: "custom", customPrompt: "핵심만 정리해줘" })
    ).toBe("핵심만 정리해줘\n\n# Title")
  })

  it("builds a provider url with an encoded q parameter", () => {
    expect(buildLlmUrl("chatgpt", "요약해줘\n\n# Title")).toContain(
      encodeURIComponent("요약해줘\n\n# Title")
    )
    expect(buildLlmUrl("claude", "# Title")).toContain(encodeURIComponent("# Title"))
  })

  it("flags oversized llm queries before opening a url", () => {
    expect(isLlmQueryTooLong("a".repeat(MAX_LLM_QUERY_LENGTH + 1))).toBe(true)
    expect(isLlmQueryTooLong("a".repeat(MAX_LLM_QUERY_LENGTH))).toBe(false)
  })
})
