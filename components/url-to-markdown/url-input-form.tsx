"use client"

import { LinkIcon, XIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"

type UrlInputFormProps = {
  value: string
  onChange: (value: string) => void
  onSubmit?: () => void
  onClear: () => void
}

export function UrlInputForm({
  value,
  onChange,
  onSubmit,
  onClear,
}: UrlInputFormProps) {
  return (
    <form
      className="flex flex-col gap-3"
      onSubmit={(event) => {
        event.preventDefault()
        onSubmit?.()
      }}
    >
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="url-input">URL</FieldLabel>
          <div className="relative">
            <LinkIcon
              aria-hidden="true"
              className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              id="url-input"
              autoFocus
              placeholder="URL을 붙여넣으세요..."
              value={value}
              onChange={(event) => onChange(event.target.value)}
              className="h-11 pr-12 pl-9"
            />
            {value ? (
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="absolute top-1/2 right-1 -translate-y-1/2"
                aria-label="URL 지우기"
                onClick={onClear}
              >
                <XIcon />
              </Button>
            ) : null}
          </div>
        </Field>
      </FieldGroup>

      <Button type="submit" className="h-11 w-full">
        변환하기
      </Button>
    </form>
  )
}
