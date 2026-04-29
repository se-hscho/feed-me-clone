import {
  copyMarkdown,
  createMarkdownFilename,
  downloadMarkdown,
} from "@/lib/url-to-markdown/export"

describe("export helpers", () => {
  it("copies raw markdown to the clipboard", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.assign(navigator, {
      clipboard: { writeText },
    })

    await copyMarkdown("# Title")

    expect(writeText).toHaveBeenCalledWith("# Title")
  })

  it("starts a markdown download with the expected filename", () => {
    const click = vi.fn()
    const createObjectURL = vi
      .spyOn(URL, "createObjectURL")
      .mockReturnValue("blob:download")
    const revokeObjectURL = vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => {})
    const anchorSpy = vi.spyOn(document, "createElement").mockReturnValue({
      click,
      set href(value: string) {},
      set download(value: string) {
        expect(value).toBe("example-title.md")
      },
    } as unknown as HTMLAnchorElement)

    downloadMarkdown("example-title.md", "# Title")

    expect(createObjectURL).toHaveBeenCalled()
    expect(click).toHaveBeenCalled()
    expect(revokeObjectURL).toHaveBeenCalledWith("blob:download")

    anchorSpy.mockRestore()
    createObjectURL.mockRestore()
    revokeObjectURL.mockRestore()
  })

  it("creates a stable markdown filename from a title", () => {
    expect(createMarkdownFilename("Example Title!")).toBe("example-title.md")
  })
})
