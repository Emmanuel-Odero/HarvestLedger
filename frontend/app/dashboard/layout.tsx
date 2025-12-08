"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Redirect to sign-in if not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/auth/signin?type=signin");
    }
  }, [user, isLoading, router]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render dashboard if not authenticated
  if (!user) {
    return null;
  }

  const handleMenuToggle = () => {
    // On mobile, toggle the mobile sidebar
    if (window.innerWidth < 1024) {
      setMobileSidebarOpen(!mobileSidebarOpen);
    } else {
      // On desktop, toggle collapse state
      setSidebarCollapsed(!sidebarCollapsed);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <DashboardHeader
        onMenuToggle={handleMenuToggle}
        sidebarOpen={mobileSidebarOpen || !sidebarCollapsed}
      />

      <div className="flex flex-1 overflow-hidden">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block">
          <DashboardSidebar
            collapsed={sidebarCollapsed}
            onCollapse={setSidebarCollapsed}
          />
        </div>

        {/* Mobile Sidebar */}
        {mobileSidebarOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
              onClick={() => setMobileSidebarOpen(false)}
            />

            {/* Sidebar */}
            <div className="fixed inset-y-0 left-0 z-40 lg:hidden">
              <DashboardSidebar
                collapsed={false}
                onCollapse={() => setMobileSidebarOpen(false)}
              />
            </div>
          </>
        )}

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {/* Responsive grid system for widget placement */}
            <div className="grid grid-cols-1 gap-6">{children}</div>
          </div>
        </main>
      </div>
    </div>
  );
}
