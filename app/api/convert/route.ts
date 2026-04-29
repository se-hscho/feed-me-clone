import { Defuddle } from "defuddle/node"
import { parseHTML } from "linkedom"
import { NextResponse } from "next/server"

import type { ConversionResult } from "@/lib/url-to-markdown/convert-url"

export const runtime = "nodejs"

type ConvertRequest = {
  url?: string
}

function isValidUrl(value: string) {
  try {
    new URL(value)
    return true
  } catch {
    return false
  }
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as ConvertRequest | null
  const url = body?.url?.trim()

  if (!url || !isValidUrl(url)) {
    return NextResponse.json({ error: "유효하지 않은 URL입니다." }, { status: 400 })
  }

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; feed-me/1.0; +https://example.com/feed-me)",
      },
    })

    if (!response.ok) {
      return NextResponse.json(
        { error: "페이지를 가져오지 못했습니다." },
        { status: 502 }
      )
    }

    const html = await response.text()
    const { document } = parseHTML(html)
    const result = await Defuddle(document, url, { markdown: true })

    const payload: ConversionResult = {
      sourceUrl: url,
      title: result.title ?? url,
      author: result.author ?? undefined,
      publishedAt: result.published ?? undefined,
      markdown: result.content ?? "",
    }

    return NextResponse.json(payload)
  } catch {
    return NextResponse.json(
      { error: "페이지를 변환하지 못했습니다." },
      { status: 502 }
    )
  }
}
