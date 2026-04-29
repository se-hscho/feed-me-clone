"use client"

import * as React from "react"
import { LoaderCircleIcon } from "lucide-react"
import { toast } from "sonner"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ExportMenu } from "@/components/url-to-markdown/export-menu"
import { PromptSelector } from "@/components/url-to-markdown/prompt-selector"
import { ResultPreview } from "@/components/url-to-markdown/result-preview"
import { ThemeToggle } from "@/components/url-to-markdown/theme-toggle"
import { UrlInputForm } from "@/components/url-to-markdown/url-input-form"
import { convertUrl, type ConversionResult } from "@/lib/url-to-markdown/convert-url"
import { copyMarkdown, createMarkdownFilename, downloadMarkdown } from "@/lib/url-to-markdown/export"
import {
  buildLlmQuery,
  buildLlmUrl,
  isLlmQueryTooLong,
  type PromptMode,
} from "@/lib/url-to-markdown/llm-handoff"

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
  const [promptMode, setPromptMode] = React.useState<PromptMode>("none")
  const [customPrompt, setCustomPrompt] = React.useState("")

  const handleSubmit = React.useCallback(async () => {
    setIsSubmitting(true)
    setResult(null)

    try {
      const nextResult = await convertUrl(url)
      setResult(nextResult)
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "페이지를 변환하지 못했습니다."
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }, [url])

  const promptSelection = React.useMemo(
    () => ({ mode: promptMode, customPrompt }),
    [customPrompt, promptMode]
  )

  const handleCopy = React.useCallback(async () => {
    if (!result) return
    await copyMarkdown(result.markdown)
    toast.success("Markdown을 복사했습니다.")
  }, [result])

  const handleDownload = React.useCallback(() => {
    if (!result) return
    downloadMarkdown(createMarkdownFilename(result.title), result.markdown)
    toast.success("Markdown 다운로드를 시작했습니다.")
  }, [result])

  const handleOpenLlm = React.useCallback(
    (provider: "chatgpt" | "claude") => {
      if (!result) return
      const query = buildLlmQuery(result.markdown, promptSelection)
      if (isLlmQueryTooLong(query)) {
        toast.error("Markdown이 너무 길어 URL로 바로 열 수 없습니다.")
        return
      }
      window.open(buildLlmUrl(provider, query), "_blank", "noopener,noreferrer")
    },
    [promptSelection, result]
  )

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col gap-6 px-4 py-8">
      <header className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold tracking-wide text-muted-foreground">
            feed-me
          </p>
        </div>
        <div className="flex items-center gap-2">
          {result ? (
            <ExportMenu
              onCopy={() => {
                void handleCopy()
              }}
              onDownload={handleDownload}
              onOpenChatGpt={() => handleOpenLlm("chatgpt")}
              onOpenClaude={() => handleOpenLlm("claude")}
            />
          ) : null}
          <ThemeToggle />
        </div>
      </header>

      <Card className="border-none shadow-none ring-1 ring-border">
        <CardHeader className="border-b">
          <CardTitle>URL to Markdown</CardTitle>
          <CardDescription>
            웹 페이지 URL을 붙여넣고 Markdown으로 변환합니다.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          {result ? (
            <div className="pb-4">
              <PromptSelector
                mode={promptMode}
                customPrompt={customPrompt}
                onModeChange={setPromptMode}
                onCustomPromptChange={setCustomPrompt}
              />
            </div>
          ) : null}
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

