import { expect, test } from "@playwright/test"

test.describe("url-to-markdown", () => {
  test("converts a url and shows the rendered preview", async ({ page }) => {
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
  })
})
