import type React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 py-4">
        <div className="container px-4 mx-auto flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-8 h-8 mr-2 bg-green-500 rounded-full"></div>
            <h1 className="text-xl font-bold text-green-700">Greenly</h1>
          </div>
          <Link href="/" passHref>
            <Button variant="ghost" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to App
            </Button>
          </Link>
        </div>
      </header>

      {/* Main content */}
      <main>{children}</main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-6 mt-12">
        <div className="container px-4 mx-auto text-center text-sm text-gray-500">
          <p>© {new Date().getFullYear()} Greenly. All rights reserved.</p>
          <p className="mt-2">Creating eco-friendly images for a sustainable future.</p>
        </div>
      </footer>
    </div>
  )
}
