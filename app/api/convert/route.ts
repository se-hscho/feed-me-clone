import { lookup } from "node:dns/promises"
import { isIP } from "node:net"
import { Defuddle } from "defuddle/node"
import { parseHTML } from "linkedom"
import { NextResponse } from "next/server"

import type { ConversionResult } from "@/lib/url-to-markdown/convert-url"

export const runtime = "nodejs"

type ConvertRequest = {
  url?: string
}

const MAX_HTML_BYTES = 5_000_000

function parseUrl(value: string) {
  try {
    return new URL(value)
  } catch {
    return null
  }
}

function isBlockedIpAddress(address: string) {
  if (address === "::1") return true
  if (address.startsWith("127.")) return true
  if (address.startsWith("10.")) return true
  if (address.startsWith("192.168.")) return true
  if (address.startsWith("169.254.")) return true

  const [first, second] = address.split(".").map(Number)
  if (first === 172 && second >= 16 && second <= 31) return true

  return false
}

async function validateSourceUrl(url: URL) {
  if (!["http:", "https:"].includes(url.protocol)) {
    return "http(s) URL만 변환할 수 있습니다."
  }

  const hostname = url.hostname.toLowerCase()
  if (hostname === "localhost") {
    return "로컬 또는 사설 네트워크 주소는 변환할 수 없습니다."
  }

  if (isIP(hostname) && isBlockedIpAddress(hostname)) {
    return "로컬 또는 사설 네트워크 주소는 변환할 수 없습니다."
  }

  try {
    const { address } = await lookup(hostname)
    if (isBlockedIpAddress(address)) {
      return "로컬 또는 사설 네트워크 주소는 변환할 수 없습니다."
    }
  } catch {
    return "호스트를 확인할 수 없습니다."
  }

  return null
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as ConvertRequest | null
  const rawUrl = body?.url?.trim()
  const url = rawUrl ? parseUrl(rawUrl) : null

  if (!url) {
    return NextResponse.json({ error: "유효하지 않은 URL입니다." }, { status: 400 })
  }

  const validationError = await validateSourceUrl(url)
  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 400 })
  }

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; feed-me/1.0; +https://example.com/feed-me)",
      },
      signal: AbortSignal.timeout(10_000),
    })

    if (!response.ok) {
      return NextResponse.json(
        { error: "페이지를 가져오지 못했습니다." },
        { status: 502 }
      )
    }

    const contentType = response.headers.get("content-type")
    if (
      contentType &&
      !contentType.includes("text/html") &&
      !contentType.includes("application/xhtml+xml")
    ) {
      return NextResponse.json(
        { error: "HTML 문서만 변환할 수 있습니다." },
        { status: 415 }
      )
    }

    const contentLength = Number(response.headers.get("content-length") ?? "0")
    if (contentLength > MAX_HTML_BYTES) {
      return NextResponse.json(
        { error: "페이지가 너무 커서 변환할 수 없습니다." },
        { status: 413 }
      )
    }

    const html = await response.text()
    if (html.length > MAX_HTML_BYTES) {
      return NextResponse.json(
        { error: "페이지가 너무 커서 변환할 수 없습니다." },
        { status: 413 }
      )
    }

    const { document } = parseHTML(html)
    const result = await Defuddle(document, url.toString(), { markdown: true })

    if (!result.content) {
      return NextResponse.json(
        { error: "페이지를 변환하지 못했습니다." },
        { status: 422 }
      )
    }

    const payload: ConversionResult = {
      sourceUrl: url.toString(),
      title: result.title ?? url.toString(),
      author: result.author ?? undefined,
      publishedAt: result.published ?? undefined,
      markdown: result.content,
    }

    return NextResponse.json(payload)
  } catch {
    return NextResponse.json(
      { error: "페이지를 변환하지 못했습니다." },
      { status: 502 }
    )
  }
}
