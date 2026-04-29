import { readFile } from "node:fs/promises"
import { expect, test } from "@playwright/test"

test.describe("url-to-markdown", () => {
  test("converts a url and supports export, llm handoff, and theme toggle", async ({
    page,
    context,
  }) => {
    await page.addInitScript(() => {
      let copiedText = ""
      Object.defineProperty(window.navigator, "clipboard", {
        configurable: true,
        value: {
          writeText: async (value: string) => {
            copiedText = value
          },
          readText: async () => copiedText,
        },
      })
    })

    await page.route("**/api/convert", async (route) => {
      await page.waitForTimeout(150)
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          sourceUrl: "https://example.com",
          title: "코드로 AI를 최대한 활용하는 방법",
          author: "Hong Gildong",
          markdown:
            "# 들어가며\n\n이 글에서는 AI 도구를 일상 개발 워크플로에 통합하는 방법을 다룹니다.",
        }),
      })
    })

    await page.goto("/")
    await page.getByLabel("URL").fill("https://example.com")
    await page.getByRole("button", { name: "변환하기" }).click()

    await expect(page.getByText("페이지를 가져오는 중...")).toBeVisible()
    await expect(
      page.getByRole("heading", { name: "코드로 AI를 최대한 활용하는 방법" })
    ).toBeVisible()
    await expect(page.getByText("저자: Hong Gildong")).toBeVisible()
    await expect(page.getByRole("heading", { name: "들어가며" })).toBeVisible()

    await expect(page.getByRole("button", { name: "요약해줘" })).toBeVisible()
    await expect(page.getByRole("button", { name: "한국어로 번역해줘" })).toBeVisible()
    await expect(page.getByRole("button", { name: "쉽게 설명해줘" })).toBeVisible()
    await expect(page.getByRole("button", { name: "직접 입력" })).toBeVisible()

    await page.getByRole("button", { name: "내보내기" }).click()
    await page.getByRole("menuitem", { name: "복사하기" }).click()
    await expect(page.getByText("Markdown을 복사했습니다.")).toBeVisible()
    const copiedText = await page.evaluate(() => window.navigator.clipboard.readText())
    expect(copiedText).toContain("# 들어가며")

    const downloadPromise = page.waitForEvent("download")
    await page.getByRole("button", { name: "내보내기" }).click()
    await page.getByRole("menuitem", { name: ".md 다운로드" }).click()
    const download = await downloadPromise
    expect(download.suggestedFilename()).toBe("ai.md")
    const downloadPath = await download.path()
    expect(downloadPath).toBeTruthy()
    expect(await readFile(downloadPath!, "utf8")).toBe(copiedText)

    const chatgptPopupPromise = context.waitForEvent("page")
    await page.getByRole("button", { name: "내보내기" }).click()
    await page.getByRole("menuitem", { name: "ChatGPT로 열기" }).click()
    const chatgptPopup = await chatgptPopupPromise
    await chatgptPopup.waitForLoadState("domcontentloaded").catch(() => {})
    expect(new URL(chatgptPopup.url()).searchParams.get("q")).toBe(copiedText)

    await page.getByRole("button", { name: "요약해줘" }).click()
    const claudePopupPromise = context.waitForEvent("page")
    await page.getByRole("button", { name: "내보내기" }).click()
    await page.getByRole("menuitem", { name: "Claude로 열기" }).click()
    const claudePopup = await claudePopupPromise
    await claudePopup.waitForLoadState("domcontentloaded").catch(() => {})
    expect(new URL(claudePopup.url()).searchParams.get("q")).toBe(`요약해줘\n\n${copiedText}`)

    await page.getByRole("button", { name: "직접 입력" }).click()
    await page
      .getByPlaceholder("원하는 프롬프트를 입력하세요...")
      .fill("핵심만 정리해줘")
    const customPopupPromise = context.waitForEvent("page")
    await page.getByRole("button", { name: "내보내기" }).click()
    await page.getByRole("menuitem", { name: "ChatGPT로 열기" }).click()
    const customPopup = await customPopupPromise
    await customPopup.waitForLoadState("domcontentloaded").catch(() => {})
    expect(new URL(customPopup.url()).searchParams.get("q")).toBe(
      `핵심만 정리해줘\n\n${copiedText}`
    )

    await page.getByRole("button", { name: "다크 모드" }).click()
    await expect(page.locator("html")).toHaveClass(/dark/)
    await page.getByRole("button", { name: "라이트 모드" }).click()
    await expect(page.locator("html")).not.toHaveClass(/dark/)
  })
})
