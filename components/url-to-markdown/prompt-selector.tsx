"use client"

import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import type { PromptMode } from "@/lib/url-to-markdown/llm-handoff"

type PromptSelectorProps = {
  mode: PromptMode
  customPrompt: string
  onModeChange: (mode: PromptMode) => void
  onCustomPromptChange: (value: string) => void
}

const options: Array<{ mode: PromptMode; label: string }> = [
  { mode: "summary", label: "요약해줘" },
  { mode: "translate-ko", label: "한국어로 번역해줘" },
  { mode: "explain-simple", label: "쉽게 설명해줘" },
  { mode: "custom", label: "직접 입력" },
]

export function PromptSelector({
  mode,
  customPrompt,
  onModeChange,
  onCustomPromptChange,
}: PromptSelectorProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <Button
            key={option.mode}
            type="button"
            variant={mode === option.mode ? "default" : "outline"}
            size="sm"
            onClick={() => onModeChange(option.mode)}
          >
            {option.label}
          </Button>
        ))}
      </div>

      {mode === "custom" ? (
        <div className="flex flex-col gap-1">
          <Textarea
            placeholder="원하는 프롬프트를 입력하세요..."
            value={customPrompt}
            onChange={(event) => onCustomPromptChange(event.target.value)}
          />
          <p className="text-xs text-muted-foreground">1회용 - 새로고침 시 사라집니다.</p>
        </div>
      ) : null}
    </div>
  )
}
