"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ChevronDown,
  User,
  Wallet,
  Settings,
  LogOut,
  Mail,
  Shield,
  Moon,
  Sun,
  Bell,
  Globe,
} from "lucide-react";
import { useRouter } from "next/navigation";

interface UserProfileDropdownProps {
  user: {
    id: string;
    email?: string;
    name?: string;
    fullName?: string;
    walletAddress: string;
    hederaAccountId?: string;
    role: string;
    isEmailVerified: boolean;
  };
  onLogout: () => void;
}

export default function UserProfileDropdown({
  user,
  onLogout,
}: UserProfileDropdownProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const router = useRouter();

  const displayName = user.fullName || user.name || "User";
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const truncateAddress = (address: string) => {
    if (address.length <= 12) return address;
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const handleProfileClick = () => {
    setDropdownOpen(false);
    router.push("/profile");
  };

  const handleWalletsClick = () => {
    setDropdownOpen(false);
    router.push("/profile/wallets");
  };

  const handleSettingsClick = () => {
    setDropdownOpen(false);
    router.push("/dashboard/settings");
  };

  const handleLogout = () => {
    setDropdownOpen(false);
    onLogout();
  };

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
    // TODO: Implement actual theme switching
  };

  const toggleNotifications = () => {
    setNotificationsEnabled(!notificationsEnabled);
    // TODO: Implement actual notification preference saving
  };

  return (
    <div className="relative">
      <Button
        variant="ghost"
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="flex items-center gap-2 h-10"
      >
        {/* Avatar */}
        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white text-sm font-semibold">
          {initials}
        </div>

        {/* Name (hidden on mobile) */}
        <span className="text-sm font-medium hidden md:inline">
          {displayName}
        </span>

        <ChevronDown className="h-4 w-4" />
      </Button>

      {/* Dropdown */}
      {dropdownOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setDropdownOpen(false)}
          />

          {/* Dropdown content */}
          <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
            {/* User Info Section */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-start gap-3">
                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white text-lg font-semibold flex-shrink-0">
                  {initials}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate">
                    {displayName}
                  </h3>
                  {user.email && (
                    <p className="text-sm text-gray-600 truncate flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      {user.email}
                    </p>
                  )}
                  <div className="flex items-center gap-2 mt-1">
                    <Badge
                      variant="secondary"
                      className="text-xs bg-emerald-100 text-emerald-800"
                    >
                      <Shield className="h-3 w-3 mr-1" />
                      {user.role}
                    </Badge>
                    {user.isEmailVerified && (
                      <Badge
                        variant="secondary"
                        className="text-xs bg-blue-100 text-blue-800"
                      >
                        Verified
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              {/* Wallet Addresses */}
              <div className="mt-3 space-y-2">
                {user.hederaAccountId && (
                  <div className="bg-gray-50 rounded-md p-2">
                    <label className="text-xs font-medium text-gray-500 uppercase">
                      Hedera
                    </label>
                    <p className="text-xs text-gray-900 font-mono mt-0.5">
                      {truncateAddress(user.hederaAccountId)}
                    </p>
                  </div>
                )}
                {user.walletAddress && (
                  <div className="bg-gray-50 rounded-md p-2">
                    <label className="text-xs font-medium text-gray-500 uppercase">
                      Wallet
                    </label>
                    <p className="text-xs text-gray-900 font-mono mt-0.5">
                      {truncateAddress(user.walletAddress)}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Menu Items */}
            <div className="py-2">
              <button
                onClick={handleProfileClick}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3"
              >
                <User className="h-4 w-4" />
                Profile Settings
              </button>
              <button
                onClick={handleWalletsClick}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3"
              >
                <Wallet className="h-4 w-4" />
                Manage Wallets
              </button>
              <button
                onClick={handleSettingsClick}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3"
              >
                <Settings className="h-4 w-4" />
                Dashboard Settings
              </button>
            </div>

            {/* Quick Settings */}
            <div className="border-t border-gray-200 py-2">
              <div className="px-4 py-1">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Quick Settings
                </p>
              </div>
              <button
                onClick={toggleTheme}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center justify-between"
              >
                <span className="flex items-center gap-3">
                  {theme === "light" ? (
                    <Sun className="h-4 w-4" />
                  ) : (
                    <Moon className="h-4 w-4" />
                  )}
                  Theme
                </span>
                <span className="text-xs text-gray-500 capitalize">
                  {theme}
                </span>
              </button>
              <button
                onClick={toggleNotifications}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center justify-between"
              >
                <span className="flex items-center gap-3">
                  <Bell className="h-4 w-4" />
                  Notifications
                </span>
                <span className="text-xs text-gray-500">
                  {notificationsEnabled ? "On" : "Off"}
                </span>
              </button>
              <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center justify-between">
                <span className="flex items-center gap-3">
                  <Globe className="h-4 w-4" />
                  Language
                </span>
                <span className="text-xs text-gray-500">English</span>
              </button>
            </div>

            {/* Logout */}
            <div className="border-t border-gray-200 p-2">
              <Button
                variant="ghost"
                onClick={handleLogout}
                className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <LogOut className="h-4 w-4 mr-3" />
                Logout
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
