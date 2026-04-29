"use client"

import * as React from "react"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { ThemeProvider } from "next-themes"

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
    </ThemeProvider>
  )
}

describe("UrlToMarkdownPage conversion flow", () => {
  beforeEach(() => {
    mockedConvertUrl.mockReset()
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
})
