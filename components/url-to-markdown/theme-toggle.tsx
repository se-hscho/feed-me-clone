"use client"

import { MoonIcon, SunIcon } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()

  const isDark = resolvedTheme === "dark"
  const label = isDark ? "라이트 모드" : "다크 모드"

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      aria-label={label}
      onClick={() => setTheme(isDark ? "light" : "dark")}
    >
      {isDark ? <SunIcon data-icon="inline-start" /> : <MoonIcon data-icon="inline-start" />}
      {label}
    </Button>
  )
}
