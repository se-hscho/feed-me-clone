"use client"

import * as React from "react"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { ThemeProvider } from "next-themes"
import { Toaster } from "sonner"

import { UrlToMarkdownPage } from "@/components/url-to-markdown/url-to-markdown-page"
import { convertUrl } from "@/lib/url-to-markdown/convert-url"

vi.mock("@/lib/url-to-markdown/convert-url", () => ({
  convertUrl: vi.fn(),
}))

const mockedConvertUrl = vi.mocked(convertUrl)

function renderPage(props?: Partial<React.ComponentProps<typeof UrlToMarkdownPage>>) {
  return render(
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
      <UrlToMarkdownPage {...props} />
      <Toaster />
    </ThemeProvider>
  )
}

describe("UrlToMarkdownPage conversion flow", () => {
  beforeEach(() => {
    mockedConvertUrl.mockReset()
    vi.restoreAllMocks()
  })

  it("shows a loading state while conversion is pending", async () => {
    let resolveConversion: ((value: Awaited<ReturnType<typeof convertUrl>>) => void) | undefined
    mockedConvertUrl.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveConversion = resolve
        })
    )

    const user = userEvent.setup()
    renderPage()

    await user.type(screen.getByLabelText("URL"), "https://example.com")
    await user.click(screen.getByRole("button", { name: "변환하기" }))

    expect(screen.getByRole("button", { name: "변환 중..." })).toBeDisabled()
    expect(screen.getByText("페이지를 가져오는 중...")).toBeInTheDocument()

    resolveConversion?.({
      sourceUrl: "https://example.com",
      title: "Example Title",
      markdown: "# Example Title",
    })

    await waitFor(() => {
      expect(screen.queryByText("페이지를 가져오는 중...")).not.toBeInTheDocument()
    })
  })

  it("renders the converted title, author, and markdown preview after success", async () => {
    mockedConvertUrl.mockResolvedValue({
      sourceUrl: "https://example.com",
      title: "코드로 AI를 최대한 활용하는 방법",
      author: "Hong Gildong",
      markdown: "# 들어가며\n\n이 글에서는 AI 도구를 일상 개발 워크플로에 통합하는 방법을 다룹니다.",
    })

    const user = userEvent.setup()
    renderPage()

    await user.type(screen.getByLabelText("URL"), "https://example.com")
    await user.click(screen.getByRole("button", { name: "변환하기" }))

    expect(await screen.findByRole("heading", { name: "코드로 AI를 최대한 활용하는 방법" })).toBeInTheDocument()
    expect(screen.getByText("저자: Hong Gildong")).toBeInTheDocument()
    expect(screen.getByRole("heading", { name: "들어가며" })).toBeInTheDocument()
    expect(screen.getByText(/AI 도구를 일상 개발 워크플로에 통합하는 방법/)).toBeInTheDocument()
  })

  it("shows a toast and keeps the input when the url is invalid", async () => {
    mockedConvertUrl.mockRejectedValue(new Error("유효하지 않은 URL입니다."))

    const user = userEvent.setup()
    renderPage()

    await user.type(screen.getByLabelText("URL"), "not-a-url")
    await user.click(screen.getByRole("button", { name: "변환하기" }))

    expect(await screen.findByText("유효하지 않은 URL입니다.")).toBeInTheDocument()
    expect(screen.getByLabelText("URL")).toHaveValue("not-a-url")
    expect(screen.getByRole("button", { name: "변환하기" })).toBeEnabled()
  })

  it("shows a failure toast and clears loading when conversion fails", async () => {
    mockedConvertUrl.mockRejectedValue(new Error("페이지를 가져오지 못했습니다."))

    const user = userEvent.setup()
    renderPage()

    await user.type(screen.getByLabelText("URL"), "https://example.com")
    await user.click(screen.getByRole("button", { name: "변환하기" }))

    expect(await screen.findByText("페이지를 가져오지 못했습니다.")).toBeInTheDocument()
    await waitFor(() => {
      expect(screen.queryByText("페이지를 가져오는 중...")).not.toBeInTheDocument()
    })
    expect(screen.getByRole("button", { name: "변환하기" })).toBeEnabled()
  })

  it("copies raw markdown and shows success feedback", async () => {
    const user = userEvent.setup()
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(window.navigator, "clipboard", {
      configurable: true,
      value: { writeText },
    })

    renderPage({
      initialUrl: "https://example.com/article",
      initialResult: {
        sourceUrl: "https://example.com/article",
        title: "테스트 문서",
        author: "홍길동",
        markdown: "# 테스트 문서\n\n본문입니다.",
      },
    })

    await user.click(screen.getByRole("button", { name: "내보내기" }))
    await user.click(screen.getByRole("menuitem", { name: "복사하기" }))

    expect(writeText).toHaveBeenCalledWith("# 테스트 문서\n\n본문입니다.")
    expect(await screen.findByText("Markdown을 복사했습니다.")).toBeInTheDocument()
  })

  it(
    "shows prompt options and opens LLM urls with the selected prompt",
    async () => {
    const user = userEvent.setup()
    const openSpy = vi.spyOn(window, "open").mockImplementation(() => null)

    renderPage({
      initialUrl: "https://example.com/article",
      initialResult: {
        sourceUrl: "https://example.com/article",
        title: "테스트 문서",
        author: "홍길동",
        markdown: "# 테스트 문서\n\n본문입니다.",
      },
    })

    expect(screen.getByRole("button", { name: "요약해줘" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "한국어로 번역해줘" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "쉽게 설명해줘" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "직접 입력" })).toBeInTheDocument()

    await user.click(screen.getByRole("button", { name: "내보내기" }))
    await user.click(screen.getByRole("menuitem", { name: "ChatGPT로 열기" }))
    expect(openSpy).toHaveBeenLastCalledWith(
      expect.stringContaining(encodeURIComponent("# 테스트 문서\n\n본문입니다.")),
      "_blank",
      "noopener,noreferrer"
    )

    await user.click(screen.getByRole("button", { name: "요약해줘" }))
    await user.click(screen.getByRole("button", { name: "내보내기" }))
    await user.click(screen.getByRole("menuitem", { name: "Claude로 열기" }))
    expect(openSpy).toHaveBeenLastCalledWith(
      expect.stringContaining(encodeURIComponent("요약해줘\n\n# 테스트 문서\n\n본문입니다.")),
      "_blank",
      "noopener,noreferrer"
    )

    await user.click(screen.getByRole("button", { name: "직접 입력" }))
    await user.type(
      screen.getByPlaceholderText("원하는 프롬프트를 입력하세요..."),
      "핵심만 정리해줘"
    )
    await user.click(screen.getByRole("button", { name: "내보내기" }))
    await user.click(screen.getByRole("menuitem", { name: "ChatGPT로 열기" }))
    expect(openSpy).toHaveBeenLastCalledWith(
      expect.stringContaining(
        encodeURIComponent("핵심만 정리해줘\n\n# 테스트 문서\n\n본문입니다.")
      ),
      "_blank",
      "noopener,noreferrer"
    )
    },
    15_000
  )
})
