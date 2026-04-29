import { POST } from "@/app/api/convert/route"

vi.mock("node:dns/promises", async (importOriginal) => {
  const actual = await importOriginal<typeof import("node:dns/promises")>()
  return {
    ...actual,
    lookup: vi.fn(),
  }
})

vi.mock("defuddle/node", () => ({
  Defuddle: vi.fn(),
}))

import { lookup } from "node:dns/promises"
import { Defuddle } from "defuddle/node"

describe("POST /api/convert", () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it("rejects localhost urls to prevent private-network fetches", async () => {
    const request = new Request("http://localhost/api/convert", {
      method: "POST",
      body: JSON.stringify({ url: "http://localhost:3000" }),
      headers: { "Content-Type": "application/json" },
    })

    const response = await POST(request)

    expect(response.status).toBe(400)
    await expect(response.json()).resolves.toEqual({
      error: "로컬 또는 사설 네트워크 주소는 변환할 수 없습니다.",
    })
  })

  it("rejects non-html responses before defuddle runs", async () => {
    vi.mocked(lookup).mockResolvedValue({ address: "93.184.216.34", family: 4 })
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      headers: new Headers({
        "content-type": "application/pdf",
        "content-length": "1024",
      }),
      text: async () => "ignored",
    } as Response)

    const request = new Request("http://localhost/api/convert", {
      method: "POST",
      body: JSON.stringify({ url: "https://example.com/file.pdf" }),
      headers: { "Content-Type": "application/json" },
    })

    const response = await POST(request)

    expect(response.status).toBe(415)
    expect(Defuddle).not.toHaveBeenCalled()
  })
})
