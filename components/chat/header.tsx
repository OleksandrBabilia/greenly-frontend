"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Menu, Plus } from "lucide-react"
import { AuthButton } from "@/components/auth/auth-button"
import { SubscriptionBadge } from "@/components/subscription/subscription-badge"
import { PremiumSubscription } from "@/components/subscription/premium-subscription"
import { useSubscription } from "@/contexts/subscription-context"

interface ChatHeaderProps {
  title: string
  isInitialMode: boolean
  setSidebarOpen: (open: boolean) => void
  createNewChat: () => void
  children?: React.ReactNode
}

export function ChatHeader({ title, isInitialMode, setSidebarOpen, createNewChat, children }: ChatHeaderProps) {
  const { isPremiumModalOpen, closePremiumModal } = useSubscription()

  return (
    <header className="sticky top-0 z-10 border-b border-green-100 bg-white">
      <div className="flex items-center justify-between h-16 px-4">
        <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(true)} className="md:hidden text-green-600">
          <Menu className="w-5 h-5" />
        </Button>

        <div className="flex-1 text-center md:text-left">
          <h2 className="text-lg font-medium text-green-700 truncate">{title || "New Chat"}</h2>
        </div>

        <div className="flex items-center gap-2">
          <SubscriptionBadge showUpgradeButton={true} />

          {!isInitialMode && (
            <Button
              variant="outline"
              size="icon"
              onClick={createNewChat}
              className="text-green-600 border-green-200 hover:bg-green-50 hover:text-green-700"
            >
              <Plus className="w-4 h-4" />
            </Button>
          )}
          {children}
          <AuthButton />
        </div>
      </div>

      {/* Premium Subscription Modal */}
      <PremiumSubscription isOpen={isPremiumModalOpen} onClose={closePremiumModal} />
    </header>
  )
}
