import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import { DemoModeProvider } from "@/lib/demo-mode-context";
import { UserJourneyProvider } from "@/lib/user-journey-context";
import { ApolloProviderWrapper } from "@/components/providers/apollo-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "HarvestLedger",
  description: "Decentralized Agricultural Supply Chain Management",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ApolloProviderWrapper>
          <DemoModeProvider>
            <UserJourneyProvider>
              <AuthProvider>{children}</AuthProvider>
            </UserJourneyProvider>
          </DemoModeProvider>
        </ApolloProviderWrapper>
      </body>
    </html>
  );
}
