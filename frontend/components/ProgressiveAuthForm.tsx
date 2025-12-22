"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation } from "@apollo/client";
import { useAuth } from "@/lib/auth-context";
import { WalletConnector, WalletType } from "@/lib/wallet-utils";
import { SEND_OTP, VERIFY_OTP, LINK_EMAIL_TO_WALLET } from "@/lib/graphql/auth";

type AuthMode =
  | "select"
  | "login"
  | "register-email"
  | "register-otp"
  | "register-wallet"
  | "complete-registration";

const SUPPORTED_WALLETS = [
  // Hedera Wallets
  {
    type: WalletType.HASHPACK,
    name: "HashPack",
    description: "Popular Hedera wallet",
    icon: "🔷",
  },
  {
    type: WalletType.BLADE,
    name: "Blade Wallet",
    description: "Multi-chain Hedera wallet",
    icon: "⚔️",
  },
  // Ethereum Wallets
  {
    type: WalletType.METAMASK,
    name: "MetaMask",
    description: "Ethereum & EVM chains",
    icon: "🦊",
  },
  // Cardano Wallets
  {
    type: WalletType.NAMI,
    name: "Nami",
    description: "Cardano light wallet",
    icon: "🌊",
  },
  {
    type: WalletType.ETERNL,
    name: "Eternl",
    description: "Cardano full-featured wallet",
    icon: "♾️",
  },
  {
    type: WalletType.LACE,
    name: "Lace",
    description: "Cardano wallet by IOG",
    icon: "🎀",
  },
  {
    type: WalletType.FLINT,
    name: "Flint",
    description: "Cardano mobile & browser wallet",
    icon: "🔥",
  },
  {
    type: WalletType.KABILA,
    name: "Kabila",
    description: "Cardano network wallet",
    icon: "🔶",
  },
  {
    type: WalletType.PORTAL,
    name: "Portal",
    description: "Cardano DeFi wallet",
    icon: "🌐",
  },
];

interface ProgressiveAuthFormProps {
  redirectUrl?: string;
}

export default function ProgressiveAuthForm({
  redirectUrl,
}: ProgressiveAuthFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { connectWallet, user } = useAuth();

  const [mode, setMode] = useState<AuthMode>("select");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [walletStatus, setWalletStatus] = useState<Record<WalletType, boolean>>(
    {} as Record<WalletType, boolean>
  );
  const [pendingWalletInfo, setPendingWalletInfo] = useState<{
    address: string;
    type: WalletType;
  } | null>(null);

  const [sendOtp] = useMutation(SEND_OTP);
  const [verifyOtp] = useMutation(VERIFY_OTP);
  const [linkEmailToWallet] = useMutation(LINK_EMAIL_TO_WALLET);

  useEffect(() => {
    // Check which wallets are available
    const checkWallets = async () => {
      const status: Record<WalletType, boolean> = {} as Record<
        WalletType,
        boolean
      >;
      // Check wallets sequentially to avoid triggering multiple connection prompts
      for (const wallet of SUPPORTED_WALLETS) {
        try {
          const isAvailable = await WalletConnector.isWalletAvailable(
            wallet.type
          );
          status[wallet.type] = isAvailable;
        } catch (error) {
          console.error(`Error checking ${wallet.type}:`, error);
          status[wallet.type] = false;
        }
      }
      setWalletStatus(status);
    };

    checkWallets();

    // Check if we're in a continuation flow (e.g., from email verification)
    const emailParam = searchParams.get("email");
    const walletParam = searchParams.get("wallet");
    const walletTypeParam = searchParams.get("walletType");

    if (emailParam && walletParam && walletTypeParam) {
      setEmail(emailParam);
      setPendingWalletInfo({
        address: walletParam,
        type: walletTypeParam.toUpperCase() as WalletType,
      });
      setMode("register-otp");
    }
  }, [searchParams]);

  // Handle login flow - wallet connection
  const handleLoginWalletConnect = async (walletType: WalletType) => {
    try {
      setLoading(true);
      setError(null);
      // For login, we use the existing wallet authentication
      if (connectWallet) {
        await connectWallet(walletType);
      } else {
        throw new Error("Wallet connection not available");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Connection failed");
    } finally {
      setLoading(false);
    }
  };

  // Handle registration - Step 1: Email input
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data } = await sendOtp({
        variables: {
          input: {
            email,
            purpose: "verification",
          },
        },
      });

      if (data?.sendOtp?.success) {
        setMode("register-otp");
        setSuccess("Verification code sent to your email");
      } else {
        setError(data?.sendOtp?.message || "Failed to send verification code");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  // Handle registration - Step 2: OTP verification
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
          },
        },
      });

      if (data?.verifyOtp?.success) {
        setSuccess("Email verified successfully!");
        // Store verified email in sessionStorage for later linking
        if (typeof window !== "undefined") {
          sessionStorage.setItem("verified_email", email);
        }
        // Move to wallet connection step
        setMode("register-wallet");
      } else {
        setError(data?.verifyOtp?.message || "Invalid verification code");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  // Handle registration - Step 3: Wallet connection after email verification
  const handleRegisterWalletConnect = async (walletType: WalletType) => {
    try {
      setLoading(true);
      setError(null);

      // Get verified email from sessionStorage
      const verifiedEmail =
        typeof window !== "undefined"
          ? sessionStorage.getItem("verified_email")
          : null;

      if (!verifiedEmail) {
        setError("Email verification not found. Please start over.");
        setMode("register-email");
        return;
      }

      // Connect wallet
      if (connectWallet) {
        await connectWallet(walletType);
      } else {
        throw new Error("Wallet connection not available");
      }

      // After wallet connection, the auth context will redirect appropriately
      // The backend authenticate_multi_wallet will handle the user creation
      // We'll link the email in the auth context or after redirect
    } catch (err) {
      setError(err instanceof Error ? err.message : "Connection failed");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setLoading(true);
    setError(null);

    try {
      const { data } = await sendOtp({
        variables: {
          input: {
            email,
            purpose: "verification",
          },
        },
      });

      if (data?.sendOtp?.success) {
        setSuccess("Verification code resent to your email");
      } else {
        setError(data?.sendOtp?.message || "Failed to resend code");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to resend code");
    } finally {
      setLoading(false);
    }
  };

  // Render initial selection screen
  if (mode === "select") {
    return (
      <div className="space-y-4">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Welcome to HarvestLedger
          </h2>
          <p className="text-gray-600">Choose an option to get started</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => setMode("login")}
            className="p-6 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all text-left group"
          >
            <div className="text-3xl mb-3">🔐</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-green-700">
              Sign In
            </h3>
            <p className="text-sm text-gray-600">
              Already have an account? Sign in with your wallet.
            </p>
          </button>

          <button
            onClick={() => setMode("register-email")}
            className="p-6 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all text-left group"
          >
            <div className="text-3xl mb-3">✨</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-green-700">
              Create Account
            </h3>
            <p className="text-sm text-gray-600">
              New to HarvestLedger? Start by verifying your email.
            </p>
          </button>
        </div>
      </div>
    );
  }

  // Render login screen - wallet connection
  if (mode === "login") {
    return (
      <div className="space-y-4">
        <div className="flex items-center mb-6">
          <button
            onClick={() => setMode("select")}
            className="mr-4 text-gray-500 hover:text-gray-700"
          >
            ← Back
          </button>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Sign In</h2>
            <p className="text-gray-600">
              Connect your wallet to access your account
            </p>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        <div className="space-y-3">
          {SUPPORTED_WALLETS.map((wallet) => {
            const isInstalled = walletStatus[wallet.type];
            return (
              <button
                key={wallet.type}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleLoginWalletConnect(wallet.type);
                }}
                disabled={loading || !isInstalled}
                className={`w-full p-4 border rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-4 ${
                  isInstalled
                    ? "border-green-200 bg-green-50 hover:border-green-500 hover:bg-green-100"
                    : "border-gray-200 bg-gray-50"
                }`}
              >
                <span className="text-2xl">{wallet.icon}</span>
                <div className="flex-1 text-left">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-900">
                      {wallet.name}
                    </span>
                    {isInstalled ? (
                      <span className="px-2 py-0.5 bg-green-600 text-white text-xs rounded-full">
                        Installed
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 bg-gray-400 text-white text-xs rounded-full">
                        Not Installed
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-600">
                    {wallet.description}
                  </div>
                </div>
                {loading && isInstalled && (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-green-600"></div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // Render registration - Step 1: Email input
  if (mode === "register-email") {
    return (
      <div className="space-y-4">
        <div className="flex items-center mb-6">
          <button
            onClick={() => setMode("select")}
            className="mr-4 text-gray-500 hover:text-gray-700"
          >
            ← Back
          </button>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Create Account</h2>
            <p className="text-gray-600">
              Start by verifying your email address
            </p>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {success && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-700 text-sm">{success}</p>
          </div>
        )}

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
            disabled={loading || !email}
            className="w-full py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Sending..." : "Send Verification Code"}
          </button>
        </form>
      </div>
    );
  }

  // Render registration - Step 2: OTP verification
  if (mode === "register-otp") {
    return (
      <div className="space-y-4">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Verify Your Email
          </h2>
          <p className="text-gray-600">
            Enter the 6-digit code sent to {email}
          </p>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {success && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-700 text-sm">{success}</p>
          </div>
        )}

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
          </div>

          <button
            type="submit"
            disabled={loading || otp.length !== 6}
            className="w-full py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Verifying..." : "Verify Code"}
          </button>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleResendOtp}
              disabled={loading}
              className="flex-1 py-2 text-green-600 hover:text-green-700 text-sm font-medium disabled:opacity-50"
            >
              Resend Code
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("register-email");
                setOtp("");
                setError(null);
                setSuccess(null);
              }}
              className="flex-1 py-2 text-gray-600 hover:text-gray-700 text-sm font-medium"
            >
              Change Email
            </button>
          </div>
        </form>
      </div>
    );
  }

  // Render registration - Step 3: Wallet connection
  if (mode === "register-wallet") {
    return (
      <div className="space-y-4">
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-semibold">
              ✓
            </div>
            <h2 className="text-2xl font-bold text-gray-900">
              Connect Your Wallet
            </h2>
          </div>
          <p className="text-gray-600">
            Email verified! Now connect your wallet to complete registration
          </p>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        <div className="space-y-3">
          {SUPPORTED_WALLETS.map((wallet) => {
            const isInstalled = walletStatus[wallet.type];
            return (
              <button
                key={wallet.type}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleRegisterWalletConnect(wallet.type);
                }}
                disabled={loading || !isInstalled}
                className={`w-full p-4 border rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-4 ${
                  isInstalled
                    ? "border-green-200 bg-green-50 hover:border-green-500 hover:bg-green-100"
                    : "border-gray-200 bg-gray-50"
                }`}
              >
                <span className="text-2xl">{wallet.icon}</span>
                <div className="flex-1 text-left">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-900">
                      {wallet.name}
                    </span>
                    {isInstalled ? (
                      <span className="px-2 py-0.5 bg-green-600 text-white text-xs rounded-full">
                        Installed
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 bg-gray-400 text-white text-xs rounded-full">
                        Not Installed
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-600">
                    {wallet.description}
                  </div>
                </div>
                {loading && isInstalled && (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-green-600"></div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return null;
}
