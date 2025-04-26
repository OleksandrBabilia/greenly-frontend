interface ErrorBannerProps {
  error: string | null
}

export function ErrorBanner({ error }: ErrorBannerProps) {
  if (!error) return null

  return (
    <div className="bg-red-50 border-b border-red-100 px-4 py-2 text-red-700 text-sm">
      <p>{error}</p>
    </div>
  )
}
