"use client";

import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Bell, Menu, X } from "lucide-react";
import BlockchainStatusIndicator from "./BlockchainStatusIndicator";
import UserProfileDropdown from "./UserProfileDropdown";
import { useState } from "react";

interface DashboardHeaderProps {
  onMenuToggle?: () => void;
  sidebarOpen?: boolean;
}

export default function DashboardHeader({
  onMenuToggle,
  sidebarOpen = true,
}: DashboardHeaderProps) {
  const { user, logout } = useAuth();
  const [notificationCount] = useState(3); // TODO: Connect to real notification system

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
        {/* Left section: Menu toggle and Logo */}
        <div className="flex items-center gap-4">
          {/* Mobile menu toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuToggle}
            className="lg:hidden"
            aria-label="Toggle menu"
          >
            {sidebarOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </Button>

          {/* Desktop sidebar toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuToggle}
            className="hidden lg:flex"
            aria-label="Toggle sidebar"
          >
            <Menu className="h-5 w-5" />
          </Button>

          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="text-2xl">🌾</div>
            <h1 className="text-xl font-bold text-gray-900 hidden sm:block">
              HarvestLedger
            </h1>
          </div>
        </div>

        {/* Right section: Blockchain status, notifications, and profile */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Blockchain Status Indicators */}
          <div className="hidden md:flex items-center gap-2">
            <BlockchainStatusIndicator blockchain="hedera" />
            <BlockchainStatusIndicator blockchain="cardano" />
          </div>

          {/* Notifications */}
          <div className="relative">
            <Button variant="ghost" size="icon" aria-label="Notifications">
              <Bell className="h-5 w-5" />
              {notificationCount > 0 && (
                <span className="absolute top-1 right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {notificationCount}
                </span>
              )}
            </Button>
          </div>

          {/* User Profile Dropdown */}
          {user && <UserProfileDropdown user={user} onLogout={logout} />}
        </div>
      </div>
    </header>
  );
}
