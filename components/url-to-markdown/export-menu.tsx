"use client"

import { ChevronDownIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

type ExportMenuProps = {
  onCopy: () => void
  onDownload: () => void
  onOpenChatGpt: () => void
  onOpenClaude: () => void
}

export function ExportMenu({
  onCopy,
  onDownload,
  onOpenChatGpt,
  onOpenClaude,
}: ExportMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button type="button" variant="outline" size="sm">
          내보내기
          <ChevronDownIcon data-icon="inline-end" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={onCopy}>복사하기</DropdownMenuItem>
          <DropdownMenuItem onClick={onDownload}>.md 다운로드</DropdownMenuItem>
          <DropdownMenuItem onClick={onOpenChatGpt}>ChatGPT로 열기</DropdownMenuItem>
          <DropdownMenuItem onClick={onOpenClaude}>Claude로 열기</DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
