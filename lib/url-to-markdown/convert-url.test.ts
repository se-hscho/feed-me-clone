import { convertUrl } from "@/lib/url-to-markdown/convert-url"

const originalFetch = global.fetch

describe("convertUrl", () => {
  afterEach(() => {
    global.fetch = originalFetch
    vi.restoreAllMocks()
  })

  it("returns parsed conversion data from the api route", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        sourceUrl: "https://example.com",
        title: "Example Title",
        author: "Jane Doe",
        markdown: "# Example Title\n\nBody text",
      }),
    } as Response)

    await expect(convertUrl("https://example.com")).resolves.toEqual({
      sourceUrl: "https://example.com",
      title: "Example Title",
      author: "Jane Doe",
      markdown: "# Example Title\n\nBody text",
    })
  })

  it("throws a friendly message when the api route reports an error", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({
        error: "변환에 실패했습니다.",
      }),
    } as Response)

    await expect(convertUrl("https://example.com")).rejects.toThrow("변환에 실패했습니다.")
  })
})
