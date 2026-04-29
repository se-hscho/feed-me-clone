"use client"

import * as React from "react"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { ThemeProvider } from "next-themes"

import { UrlToMarkdownPage } from "@/components/url-to-markdown/url-to-markdown-page"

function renderPage(props?: Partial<React.ComponentProps<typeof UrlToMarkdownPage>>) {
  return render(
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
      <UrlToMarkdownPage {...props} />
    </ThemeProvider>
  )
}

describe("UrlToMarkdownPage shell", () => {
  it("shows an empty focused url field and top-level actions on first load", () => {
    renderPage()

    const input = screen.getByLabelText("URL")

    expect(input).toHaveValue("")
    expect(input).toHaveFocus()
    expect(screen.getByRole("button", { name: "변환하기" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "다크 모드" })).toBeInTheDocument()
  })

  it("clears the url field when the clear button is pressed", async () => {
    const user = userEvent.setup()

    renderPage()

    const input = screen.getByLabelText("URL")
    await user.type(input, "https://example.com")
    await user.click(screen.getByRole("button", { name: "URL 지우기" }))

    expect(input).toHaveValue("")
  })

  it("removes the visible result area when clear is pressed", async () => {
    const user = userEvent.setup()

    renderPage({
      initialUrl: "https://example.com/article",
      initialResult: {
        title: "테스트 문서",
        author: "홍길동",
        markdown: "# 테스트 문서\n\n본문입니다.",
      },
    })

    expect(screen.getByRole("region", { name: "변환 결과" })).toBeInTheDocument()

    await user.click(screen.getByRole("button", { name: "URL 지우기" }))

    expect(screen.queryByRole("region", { name: "변환 결과" })).not.toBeInTheDocument()
    expect(screen.getByLabelText("URL")).toHaveValue("")
  })
})
