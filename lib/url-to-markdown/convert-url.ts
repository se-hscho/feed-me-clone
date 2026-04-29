export type ConversionResult = {
  sourceUrl: string
  title: string
  author?: string
  publishedAt?: string
  markdown: string
}

type ConvertUrlErrorResponse = {
  error?: string
}

export async function convertUrl(url: string): Promise<ConversionResult> {
  const response = await fetch("/api/convert", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ url }),
  })

  if (!response.ok) {
    const data = (await response.json().catch(() => null)) as ConvertUrlErrorResponse | null
    throw new Error(data?.error ?? "변환에 실패했습니다.")
  }

  return (await response.json()) as ConversionResult
}
