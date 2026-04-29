"use client"

import * as React from "react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ThemeToggle } from "@/components/url-to-markdown/theme-toggle"
import { UrlInputForm } from "@/components/url-to-markdown/url-input-form"

type InitialResult = {
  title: string
  author?: string
  markdown: string
}

type UrlToMarkdownPageProps = {
  initialUrl?: string
  initialResult?: InitialResult | null
}

export function UrlToMarkdownPage({
  initialUrl = "",
  initialResult = null,
}: UrlToMarkdownPageProps) {
  const [url, setUrl] = React.useState(initialUrl)
  const [result, setResult] = React.useState<InitialResult | null>(initialResult)

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col gap-6 px-4 py-8">
      <header className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold tracking-wide text-muted-foreground">
            feed-me
          </p>
        </div>
        <ThemeToggle />
      </header>

      <Card className="border-none shadow-none ring-1 ring-border">
        <CardHeader className="border-b">
          <CardTitle>URL to Markdown</CardTitle>
          <CardDescription>
            웹 페이지 URL을 붙여넣고 Markdown으로 변환합니다.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <UrlInputForm
            value={url}
            onChange={setUrl}
            onClear={() => {
              setUrl("")
              setResult(null)
            }}
          />
        </CardContent>
      </Card>

      {result ? (
        <section
          aria-label="변환 결과"
          className="rounded-xl border bg-card p-4 text-card-foreground"
        >
          <div className="border-b pb-3">
            <h2 className="text-base font-semibold">{result.title}</h2>
            {result.author ? (
              <p className="text-sm text-muted-foreground">저자: {result.author}</p>
            ) : null}
          </div>
          <div className="pt-3">
            <pre className="overflow-x-auto whitespace-pre-wrap text-sm">
              {result.markdown}
            </pre>
          </div>
        </section>
      ) : null}
    </main>
  )
}

