"use client"

import ReactMarkdown from "react-markdown"

import type { ConversionResult } from "@/lib/url-to-markdown/convert-url"

type ResultPreviewProps = {
  result: ConversionResult
}

export function ResultPreview({ result }: ResultPreviewProps) {
  return (
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

      <div className="prose prose-neutral max-w-none pt-3 dark:prose-invert">
        <ReactMarkdown>{result.markdown}</ReactMarkdown>
      </div>
    </section>
  )
}
