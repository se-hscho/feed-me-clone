"use client"

import * as React from "react"
import { LoaderCircleIcon } from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ResultPreview } from "@/components/url-to-markdown/result-preview"
import { ThemeToggle } from "@/components/url-to-markdown/theme-toggle"
import { UrlInputForm } from "@/components/url-to-markdown/url-input-form"
import { convertUrl, type ConversionResult } from "@/lib/url-to-markdown/convert-url"

type UrlToMarkdownPageProps = {
  initialUrl?: string
  initialResult?: ConversionResult | null
}

export function UrlToMarkdownPage({
  initialUrl = "",
  initialResult = null,
}: UrlToMarkdownPageProps) {
  const [url, setUrl] = React.useState(initialUrl)
  const [result, setResult] = React.useState<ConversionResult | null>(initialResult)
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const handleSubmit = React.useCallback(async () => {
    setIsSubmitting(true)

    try {
      const nextResult = await convertUrl(url)
      setResult(nextResult)
    } finally {
      setIsSubmitting(false)
    }
  }, [url])

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
            onSubmit={handleSubmit}
            onClear={() => {
              setUrl("")
              setResult(null)
            }}
            isSubmitting={isSubmitting}
          />
        </CardContent>
      </Card>

      {isSubmitting ? (
        <section className="flex flex-col items-center gap-3 rounded-xl border border-dashed bg-card px-4 py-12 text-card-foreground">
          <LoaderCircleIcon className="animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">페이지를 가져오는 중...</p>
        </section>
      ) : null}

      {result ? <ResultPreview result={result} /> : null}
    </main>
  )
}

