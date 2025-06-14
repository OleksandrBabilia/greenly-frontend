"use client"

import { useSubscription } from "@/contexts/subscription-context"
import { Badge } from "@/components/ui/badge"
import { Crown, Loader2, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuth } from "@/contexts/auth-context"

interface SubscriptionBadgeProps {
  showUpgradeButton?: boolean
}

export function SubscriptionBadge({ showUpgradeButton = false }: SubscriptionBadgeProps) {
  const { tier, isLoading, openPremiumModal, navigateToSubscriptionPage } = useSubscription()
  const { isAuthenticated } = useAuth()

  if (isLoading) {
    return (
      <Badge variant="outline" className="gap-1 bg-gray-100 text-gray-500">
        <Loader2 className="h-3 w-3 animate-spin" />
        <span>Loading...</span>
      </Badge>
    )
  }

  if (tier === "premium") {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 gap-1 cursor-pointer">
            <Crown className="h-3 w-3" />
            <span>Premium</span>
            <ChevronDown className="h-3 w-3 ml-1" />
          </Badge>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Premium Subscription</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={navigateToSubscriptionPage}>Manage Subscription</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  if (showUpgradeButton && isAuthenticated) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="text-xs h-7 px-2 border-green-200 text-green-700 hover:bg-green-50 hover:text-green-800"
          >
            Upgrade to Premium
            <ChevronDown className="h-3 w-3 ml-1" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Subscription Options</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={openPremiumModal}>View Premium Plans</DropdownMenuItem>
          <DropdownMenuItem onClick={navigateToSubscriptionPage}>Manage Subscription</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  if (showUpgradeButton) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={openPremiumModal}
        className="text-xs h-7 px-2 border-green-200 text-green-700 hover:bg-green-50 hover:text-green-800"
      >
        Upgrade to Premium
      </Button>
    )
  }

  return (
    <Badge variant="outline" className="bg-gray-100 text-gray-600 hover:bg-gray-200">
      Free Plan
    </Badge>
  )
}
