"use client";

import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Home,
  Sprout,
  Package,
  FileText,
  ShoppingCart,
  CheckCircle,
  BarChart3,
  Settings,
  Plus,
  Send,
  Coins,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

interface DashboardSidebarProps {
  collapsed: boolean;
  onCollapse?: (collapsed: boolean) => void;
}

interface NavItem {
  label: string;
  icon: React.ReactNode;
  href: string;
  roles?: string[];
}

interface QuickAction {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  roles?: string[];
}

export default function DashboardSidebar({
  collapsed,
  onCollapse,
}: DashboardSidebarProps) {
  const { user } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const navigationItems: NavItem[] = [
    {
      label: "Dashboard",
      icon: <Home className="h-5 w-5" />,
      href: "/dashboard",
    },
    {
      label: "Harvests",
      icon: <Sprout className="h-5 w-5" />,
      href: "/dashboard/harvests",
      roles: ["farmer", "admin"],
    },
    {
      label: "Tokenized Crops",
      icon: <Coins className="h-5 w-5" />,
      href: "/dashboard/tokens",
      roles: ["farmer", "buyer", "admin"],
    },
    {
      label: "Marketplace",
      icon: <ShoppingCart className="h-5 w-5" />,
      href: "/dashboard/marketplace",
      roles: ["buyer", "admin"],
    },
    {
      label: "Certifications",
      icon: <CheckCircle className="h-5 w-5" />,
      href: "/dashboard/certifications",
      roles: ["inspector", "admin"],
    },
    {
      label: "Quality Reports",
      icon: <FileText className="h-5 w-5" />,
      href: "/dashboard/reports",
      roles: ["inspector", "admin"],
    },
    {
      label: "Analytics",
      icon: <BarChart3 className="h-5 w-5" />,
      href: "/dashboard/analytics",
    },
    {
      label: "Blockchain",
      icon: <Package className="h-5 w-5" />,
      href: "/dashboard/blockchain-showcase",
    },
    {
      label: "Settings",
      icon: <Settings className="h-5 w-5" />,
      href: "/dashboard/settings",
    },
  ];

  const quickActions: QuickAction[] = [
    {
      label: "Record Harvest",
      icon: <Plus className="h-4 w-4" />,
      onClick: () => router.push("/dashboard/harvests/new"),
      roles: ["farmer", "admin"],
    },
    {
      label: "Mint Token",
      icon: <Coins className="h-4 w-4" />,
      onClick: () => router.push("/dashboard/tokens/mint"),
      roles: ["farmer", "admin"],
    },
    {
      label: "Transfer Token",
      icon: <Send className="h-4 w-4" />,
      onClick: () => router.push("/dashboard/tokens/transfer"),
      roles: ["farmer", "buyer", "admin"],
    },
    {
      label: "Issue Certificate",
      icon: <CheckCircle className="h-4 w-4" />,
      onClick: () => router.push("/dashboard/certifications/new"),
      roles: ["inspector", "admin"],
    },
  ];

  const isItemVisible = (roles?: string[]) => {
    if (!roles || roles.length === 0) return true;
    return user?.role && roles.includes(user.role);
  };

  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname === href;
    }
    return pathname?.startsWith(href);
  };

  const visibleNavItems = navigationItems.filter((item) =>
    isItemVisible(item.roles)
  );
  const visibleQuickActions = quickActions.filter((action) =>
    isItemVisible(action.roles)
  );

  return (
    <aside
      className={cn(
        "bg-white border-r border-gray-200 transition-all duration-300 ease-in-out",
        collapsed ? "w-16" : "w-64",
        "flex flex-col h-full"
      )}
    >
      {/* Navigation Menu */}
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-2">
          {visibleNavItems.map((item) => (
            <li key={item.href}>
              <Button
                variant={isActive(item.href) ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start",
                  collapsed ? "px-2" : "px-4",
                  isActive(item.href) &&
                    "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                )}
                onClick={() => router.push(item.href)}
                title={collapsed ? item.label : undefined}
              >
                <span className={cn(collapsed ? "mx-auto" : "mr-3")}>
                  {item.icon}
                </span>
                {!collapsed && (
                  <span className="text-sm font-medium">{item.label}</span>
                )}
              </Button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Quick Actions Panel */}
      {!collapsed && visibleQuickActions.length > 0 && (
        <div className="border-t border-gray-200 p-4">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Quick Actions
          </h3>
          <div className="space-y-2">
            {visibleQuickActions.map((action, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                className="w-full justify-start text-sm"
                onClick={action.onClick}
              >
                <span className="mr-2">{action.icon}</span>
                {action.label}
              </Button>
            ))}
          </div>
        </div>
      )}
    </aside>
  );
}
