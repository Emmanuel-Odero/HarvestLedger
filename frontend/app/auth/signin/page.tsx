"use client";

import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Leaf, ArrowRight } from "lucide-react";
import ProgressiveAuthForm from "@/components/ProgressiveAuthForm";
import { useAuth } from "@/lib/auth-context";
import { useEffect } from "react";

export default function SignInPage() {
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect");
  const { user, isLoading } = useAuth();
  const router = useRouter();

  // Redirect to dashboard if already logged in
  useEffect(() => {
    if (!isLoading && user) {
      router.push(redirectUrl || "/dashboard");
    }
  }, [user, isLoading, redirectUrl, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Navigation */}
      <nav className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-emerald-500 to-green-500 rounded-lg">
              <Leaf className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
              HarvestLedger
            </span>
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            <a
              href="/#features"
              className="text-gray-600 hover:text-emerald-600 transition-colors"
            >
              Features
            </a>
            <a
              href="/#how-it-works"
              className="text-gray-600 hover:text-emerald-600 transition-colors"
            >
              How It Works
            </a>
            <a
              href="/#testimonials"
              className="text-gray-600 hover:text-emerald-600 transition-colors"
            >
              Testimonials
            </a>
          </div>

          <div className="flex items-center space-x-4">
            {user ? (
              <Button
                className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700"
                asChild
              >
                <Link href="/dashboard">
                  Dashboard
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            ) : (
              <>
                <Button variant="ghost" asChild>
                  <Link href="/auth/signin?type=signin">Sign In</Link>
                </Button>
                <Button
                  className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700"
                  asChild
                >
                  <Link href="/auth/signin?type=onboarding">
                    Get Started
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Sign In Form */}
      <div className="flex items-center justify-center p-4 min-h-[calc(100vh-80px)]">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
          <ProgressiveAuthForm redirectUrl={redirectUrl || undefined} />

          <div className="mt-8 text-center">
            <p className="text-xs text-gray-500">
              By continuing, you agree to our Terms of Service and Privacy
              Policy. Your wallet signature serves as your digital identity
              verification.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
