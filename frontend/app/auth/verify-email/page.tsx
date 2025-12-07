"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation } from "@apollo/client";
import { useAuth } from "@/lib/auth-context";
import { SEND_OTP, VERIFY_OTP, LINK_EMAIL_TO_WALLET } from "@/lib/graphql/auth";

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"email" | "otp">("email");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [sendOtp] = useMutation(SEND_OTP);
  const [verifyOtp] = useMutation(VERIFY_OTP);
  const [linkEmailToWallet] = useMutation(LINK_EMAIL_TO_WALLET);

  // Get wallet info from URL params or user session
  const walletAddress = searchParams.get("wallet") || user?.hederaAccountId;
  const walletType = searchParams.get("walletType") || user?.walletType;

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (walletAddress && walletType) {
        // Link email to wallet and send OTP
        const { data } = await linkEmailToWallet({
          variables: {
            email,
            walletAddress,
            walletType: walletType.toUpperCase(),
          },
        });

        if (data?.linkEmailToWallet?.success) {
          setStep("otp");
          setSuccess("Verification code sent to your email");
        } else {
          setError(
            data?.linkEmailToWallet?.message ||
              "Failed to send verification code"
          );
        }
      } else {
        // Just send OTP
        const { data } = await sendOtp({
          variables: {
            input: {
              email,
              purpose: "verification",
            },
          },
        });

        if (data?.sendOtp?.success) {
          setStep("otp");
          setSuccess("Verification code sent to your email");
        } else {
          setError(
            data?.sendOtp?.message || "Failed to send verification code"
          );
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data } = await verifyOtp({
        variables: {
          input: {
            email,
            otp,
            purpose: "verification",
            walletAddress: walletAddress || undefined,
            walletType: walletType ? walletType.toUpperCase() : undefined,
          },
        },
      });

      if (data?.verifyOtp?.success) {
        setSuccess("Email verified successfully!");
        // Redirect to wallet selection
        setTimeout(() => {
          router.push(`/auth/select-wallet?email=${encodeURIComponent(email)}`);
        }, 1500);
      } else {
        setError(data?.verifyOtp?.message || "Invalid verification code");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setLoading(true);
    setError(null);

    try {
      if (walletAddress && walletType) {
        await linkEmailToWallet({
          variables: {
            email,
            walletAddress,
            walletType: walletType.toUpperCase(),
          },
        });
      } else {
        await sendOtp({
          variables: {
            input: {
              email,
              purpose: "verification",
            },
          },
        });
      }
      setSuccess("Verification code resent to your email");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to resend code");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {step === "email" ? "Verify Your Email" : "Enter Verification Code"}
          </h1>
          <p className="text-gray-600">
            {step === "email"
              ? "We need to verify your email address to complete your registration."
              : "Enter the 6-digit code sent to your email address."}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-700 text-sm">{success}</p>
          </div>
        )}

        {step === "email" ? (
          <form onSubmit={handleEmailSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="you@example.com"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Sending..." : "Send Verification Code"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleOtpSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="otp"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Verification Code
              </label>
              <input
                id="otp"
                type="text"
                value={otp}
                onChange={(e) =>
                  setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                }
                required
                maxLength={6}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-center text-2xl tracking-widest font-mono"
                placeholder="000000"
              />
              <p className="mt-2 text-sm text-gray-500 text-center">
                Code sent to {email}
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || otp.length !== 6}
              className="w-full py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Verifying..." : "Verify Code"}
            </button>

            <button
              type="button"
              onClick={handleResendOtp}
              disabled={loading}
              className="w-full py-2 text-green-600 hover:text-green-700 text-sm font-medium disabled:opacity-50"
            >
              Resend Code
            </button>

            <button
              type="button"
              onClick={() => {
                setStep("email");
                setOtp("");
                setError(null);
                setSuccess(null);
              }}
              className="w-full py-2 text-gray-600 hover:text-gray-700 text-sm font-medium"
            >
              Change Email
            </button>
          </form>
        )}

        <div className="mt-8 text-center">
          <p className="text-xs text-gray-500">
            Having trouble? Check your spam folder or contact support.
          </p>
        </div>
      </div>
    </div>
  );
}
