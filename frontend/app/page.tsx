"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Leaf,
  Shield,
  BarChart3,
  Globe,
  CheckCircle,
  ArrowRight,
  Play,
  Users,
  TrendingUp,
  Link as LinkIcon,
  Coins,
  Database,
  UserPlus,
  ShieldCheck,
  Quote,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";

export default function LandingPage() {
  const { user } = useAuth();
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-amber-50">
      {/* Navigation */}
      <nav className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-emerald-500 to-green-500 rounded-lg">
              <Leaf className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
              HarvestLedger
            </span>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            <a
              href="#features"
              className="text-gray-600 hover:text-emerald-600 transition-colors"
            >
              Features
            </a>
            <a
              href="#how-it-works"
              className="text-gray-600 hover:text-emerald-600 transition-colors"
            >
              How It Works
            </a>
            <a
              href="#blockchain"
              className="text-gray-600 hover:text-emerald-600 transition-colors"
            >
              Blockchain
            </a>
            <Link
              href="/pitch-deck"
              className="text-gray-600 hover:text-emerald-600 transition-colors font-medium"
            >
              Pitch Deck
            </Link>
            <a
              href="#testimonials"
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

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-20">
        <div className="flex flex-col lg:flex-row items-center justify-between">
          <div className="lg:w-1/2 mb-12 lg:mb-0">
            <Badge className="mb-4 bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-200">
              🚀 Multi-Chain Blockchain Platform
            </Badge>

            <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
              Modern Farming
              <span className="block bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
                Meets Blockchain
              </span>
            </h1>

            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Track, verify, and optimize your agricultural supply chain with
              Hedera and Cardano blockchain integration. Ensure transparency
              from seed to shelf while maximizing your profits.
            </p>

            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              <Button
                size="lg"
                className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white px-8 py-3 text-lg"
                asChild
              >
                <Link href="/auth/signin?type=trial">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>

              <Button
                size="lg"
                variant="outline"
                className="px-8 py-3 text-lg border-2"
                asChild
              >
                <Link href="#demo">
                  <Play className="mr-2 h-5 w-5" />
                  Watch Demo
                </Link>
              </Button>
            </div>

            <div className="flex items-center mt-8 space-x-6 text-sm text-gray-500">
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-emerald-500 mr-2" />
                No credit card required
              </div>
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-emerald-500 mr-2" />
                14-day free trial
              </div>
            </div>
          </div>

          <div className="lg:w-1/2 relative">
            <div className="relative z-10 bg-white rounded-2xl shadow-2xl p-8 border border-gray-100">
              <div className="grid grid-cols-2 gap-6">
                <Card className="border-0 shadow-lg bg-gradient-to-br from-emerald-50 to-green-50">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center text-emerald-700">
                      <BarChart3 className="h-6 w-6 mr-2" />
                      Yield Tracking
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-emerald-600">
                      Real-time monitoring of crop yields and quality metrics
                    </CardDescription>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-lg bg-gradient-to-br from-amber-50 to-orange-50">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center text-amber-700">
                      <Shield className="h-6 w-6 mr-2" />
                      Blockchain Security
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-amber-600">
                      Immutable records on Hedera Hashgraph
                    </CardDescription>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-cyan-50">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center text-blue-700">
                      <Globe className="h-6 w-6 mr-2" />
                      Supply Chain
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-blue-600">
                      End-to-end traceability from farm to consumer
                    </CardDescription>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-pink-50">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center text-purple-700">
                      <TrendingUp className="h-6 w-6 mr-2" />
                      Profit Analytics
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-purple-600">
                      Smart insights for better financial decisions
                    </CardDescription>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Background decorative elements */}
            <div className="absolute -top-4 -right-4 w-72 h-72 bg-emerald-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
            <div className="absolute -bottom-8 -left-8 w-72 h-72 bg-amber-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse animation-delay-2000"></div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-white border-y border-gray-100">
        <div className="container mx-auto px-6 py-16">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-emerald-600 mb-2">
                500+
              </div>
              <div className="text-gray-600">Farms Connected</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-emerald-600 mb-2">
                2 Chains
              </div>
              <div className="text-gray-600">Blockchain Networks</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-emerald-600 mb-2">
                99.9%
              </div>
              <div className="text-gray-600">Uptime Reliability</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-emerald-600 mb-2">
                24/7
              </div>
              <div className="text-gray-600">Support Available</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-200">
            ✨ Powerful Features
          </Badge>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Everything You Need for Modern Farming
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Our comprehensive platform combines cutting-edge technology with
            agricultural expertise
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              <CardHeader>
                <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-emerald-500 to-green-500 rounded-lg mb-4">
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
                <CardDescription className="text-lg">
                  {feature.description}
                </CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      {/* How It Works Section */}
      <section
        id="how-it-works"
        className="bg-gradient-to-br from-emerald-50 via-white to-green-50"
      >
        <div className="container mx-auto px-6 py-20">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-200">
              📋 Simple Process
            </Badge>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Get started with HarvestLedger in five simple steps
            </p>
          </div>

          {/* Desktop: Horizontal Timeline */}
          <div className="hidden lg:block">
            <div className="relative">
              {/* Timeline Line */}
              <div className="absolute top-16 left-0 right-0 h-1 bg-gradient-to-r from-emerald-200 via-emerald-400 to-emerald-600"></div>

              <div className="grid grid-cols-5 gap-4">
                {workflowSteps.map((step, index) => (
                  <div key={index} className="relative">
                    {/* Number Circle */}
                    <div className="flex justify-center mb-6">
                      <div className="relative z-10 flex items-center justify-center w-16 h-16 bg-gradient-to-r from-emerald-500 to-green-500 rounded-full text-white text-2xl font-bold shadow-lg">
                        {step.number}
                      </div>
                    </div>

                    {/* Content Card */}
                    <Card className="border-2 border-emerald-100 shadow-lg hover:shadow-xl transition-all duration-300">
                      <CardHeader className="text-center">
                        <div className="flex justify-center mb-3">
                          <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-emerald-500 to-green-500 rounded-lg">
                            <step.icon className="h-6 w-6 text-white" />
                          </div>
                        </div>
                        <CardTitle className="text-lg mb-2">
                          {step.title}
                        </CardTitle>
                        <CardDescription className="text-sm">
                          {step.description}
                        </CardDescription>
                        {step.userRole && (
                          <Badge className="mt-3 bg-emerald-50 text-emerald-700 border-emerald-200 text-xs">
                            {step.userRole}
                          </Badge>
                        )}
                      </CardHeader>
                    </Card>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Mobile/Tablet: Vertical Timeline */}
          <div className="lg:hidden space-y-6">
            {workflowSteps.map((step, index) => (
              <div key={index} className="flex gap-4">
                {/* Number Circle */}
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-emerald-500 to-green-500 rounded-full text-white text-xl font-bold shadow-lg">
                    {step.number}
                  </div>
                  {index < workflowSteps.length - 1 && (
                    <div className="ml-6 mt-2 h-16 w-1 bg-gradient-to-b from-emerald-400 to-emerald-200"></div>
                  )}
                </div>

                {/* Content Card */}
                <Card className="flex-1 border-2 border-emerald-100 shadow-lg">
                  <CardHeader>
                    <div className="flex items-start gap-3 mb-2">
                      <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-emerald-500 to-green-500 rounded-lg flex-shrink-0">
                        <step.icon className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-lg mb-1">
                          {step.title}
                        </CardTitle>
                        {step.userRole && (
                          <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs">
                            {step.userRole}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <CardDescription className="text-sm">
                      {step.description}
                    </CardDescription>
                  </CardHeader>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Blockchain Integration Section */}
      <section id="blockchain" className="bg-white">
        <div className="container mx-auto px-6 py-20">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200">
              ⛓️ Multi-Chain Technology
            </Badge>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Blockchain Integration
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Leverage the power of two leading blockchain platforms
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Hedera Card */}
            <Card className="border-2 border-purple-200 shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden">
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 text-white">
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex items-center justify-center w-12 h-12 bg-white/20 rounded-lg backdrop-blur-sm">
                    <Database className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold">Hedera</h3>
                </div>
                <p className="text-purple-100 text-sm">
                  Enterprise-grade distributed ledger technology
                </p>
              </div>
              <CardContent className="p-6">
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-purple-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold text-gray-900">
                        Consensus Service (HCS)
                      </div>
                      <div className="text-sm text-gray-600">
                        Immutable event logging for supply chain tracking
                      </div>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-purple-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold text-gray-900">
                        Token Service (HTS)
                      </div>
                      <div className="text-sm text-gray-600">
                        Native crop tokenization without smart contracts
                      </div>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-purple-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold text-gray-900">
                        Smart Contracts
                      </div>
                      <div className="text-sm text-gray-600">
                        Automated agreements for loans and escrow
                      </div>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-purple-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold text-gray-900">
                        Low-Cost Transactions
                      </div>
                      <div className="text-sm text-gray-600">
                        Predictable fees at $0.0001 per transaction
                      </div>
                    </div>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Cardano Card */}
            <Card className="border-2 border-blue-200 shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 text-white">
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex items-center justify-center w-12 h-12 bg-white/20 rounded-lg backdrop-blur-sm">
                    <Coins className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold">Cardano</h3>
                </div>
                <p className="text-blue-100 text-sm">
                  Research-driven proof-of-stake blockchain
                </p>
              </div>
              <CardContent className="p-6">
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold text-gray-900">
                        Native Tokens
                      </div>
                      <div className="text-sm text-gray-600">
                        Mint tokens without smart contracts for efficiency
                      </div>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold text-gray-900">
                        Transaction Metadata
                      </div>
                      <div className="text-sm text-gray-600">
                        Attach rich data to track supply chain events
                      </div>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold text-gray-900">
                        Plutus Contracts
                      </div>
                      <div className="text-sm text-gray-600">
                        Advanced smart contracts for complex DeFi operations
                      </div>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold text-gray-900">
                        UTxO Model
                      </div>
                      <div className="text-sm text-gray-600">
                        Enhanced security and predictable transaction outcomes
                      </div>
                    </div>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section
        id="testimonials"
        className="bg-gradient-to-br from-amber-50 via-white to-emerald-50"
      >
        <div className="container mx-auto px-6 py-20">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-200">
              💬 Success Stories
            </Badge>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              What Our Users Say
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Real experiences from farmers, cooperatives, and buyers worldwide
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <Card
                key={index}
                className="border-2 border-gray-100 shadow-lg hover:shadow-xl transition-all duration-300 relative"
              >
                <CardHeader>
                  <Quote className="h-8 w-8 text-emerald-500 mb-4 opacity-50" />
                  <CardDescription className="text-base text-gray-700 leading-relaxed mb-6 italic">
                    "{testimonial.quote}"
                  </CardDescription>
                  <div className="border-t border-gray-100 pt-4">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-emerald-500 to-green-500 rounded-full text-white font-bold text-lg">
                        {testimonial.author
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </div>
                      <div>
                        <CardTitle className="text-lg text-gray-900">
                          {testimonial.author}
                        </CardTitle>
                        <div className="text-sm text-gray-600">
                          {testimonial.role}
                        </div>
                        {testimonial.location && (
                          <div className="text-xs text-gray-500 mt-0.5">
                            📍 {testimonial.location}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-emerald-600 to-green-600 text-white">
        <div className="container mx-auto px-6 py-20 text-center">
          <h2 className="text-4xl font-bold mb-4">
            Ready to Transform Your Farming Business?
          </h2>
          <p className="text-xl text-emerald-100 mb-8 max-w-2xl mx-auto">
            Join hundreds of farmers and buyers using blockchain technology to
            revolutionize agriculture
          </p>
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Button
              size="lg"
              className="bg-white text-emerald-600 hover:bg-gray-100 px-8 py-3 text-lg font-semibold"
              asChild
            >
              <Link href="/auth/signin?type=trial">
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-emerald-600 px-8 py-3 text-lg font-semibold"
              asChild
            >
              <Link href="/auth/signin?type=demo">Schedule Demo</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white">
        <div className="container mx-auto px-6 py-12">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-r from-emerald-500 to-green-500 rounded-lg">
                <Leaf className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold">HarvestLedger</span>
            </div>

            <div className="flex space-x-6 text-gray-400">
              <a href="#" className="hover:text-white transition-colors">
                Privacy
              </a>
              <a href="#" className="hover:text-white transition-colors">
                Terms
              </a>
              <a href="#" className="hover:text-white transition-colors">
                Contact
              </a>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>
              &copy; 2024 HarvestLedger. All rights reserved. Built with ❤️ for
              the agricultural community.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

const workflowSteps = [
  {
    number: 1,
    title: "Register & Connect Wallet",
    description:
      "Create your account and connect your Hedera or Cardano wallet to get started",
    icon: UserPlus,
    userRole: "All Users",
  },
  {
    number: 2,
    title: "Record Harvest",
    description:
      "Log your crop information to the blockchain for immutable tracking",
    icon: Leaf,
    userRole: "Farmers",
  },
  {
    number: 3,
    title: "Tokenize Crops",
    description: "Convert your harvest into tradeable blockchain tokens",
    icon: Coins,
    userRole: "Farmers",
  },
  {
    number: 4,
    title: "Verify & Trade",
    description: "Buyers verify authenticity and purchase tokens directly",
    icon: ShieldCheck,
    userRole: "Buyers",
  },
  {
    number: 5,
    title: "Track Supply Chain",
    description:
      "Monitor your products from farm to consumer with full transparency",
    icon: TrendingUp,
    userRole: "All Users",
  },
];

const testimonials = [
  {
    quote:
      "HarvestLedger transformed how we track our organic coffee from farm to export. The blockchain verification gives our buyers complete confidence.",
    author: "Sarah Kimani",
    role: "Coffee Farmer",
    location: "Kenya",
  },
  {
    quote:
      "As a cooperative manager, the tokenization feature has opened up new financing opportunities for our 200+ member farmers. Game-changing platform.",
    author: "James Omondi",
    role: "Cooperative Manager",
    location: "Uganda",
  },
  {
    quote:
      "The supply chain transparency is exactly what we needed. We can verify every step from harvest to our warehouse, reducing fraud by 95%.",
    author: "Maria Santos",
    role: "Agricultural Buyer",
    location: "Philippines",
  },
];

const features = [
  {
    icon: BarChart3,
    title: "Smart Analytics",
    description: "Advanced insights into crop performance and market trends",
  },
  {
    icon: Shield,
    title: "Blockchain Security",
    description: "Tamper-proof records on Hedera Hashgraph network",
  },
  {
    icon: Globe,
    title: "Supply Chain Tracking",
    description: "Complete visibility from planting to distribution",
  },
  {
    icon: Users,
    title: "Stakeholder Management",
    description: "Connect with buyers, suppliers, and partners seamlessly",
  },
  {
    icon: TrendingUp,
    title: "Profit Optimization",
    description: "Data-driven recommendations to maximize your revenue",
  },
  {
    icon: Leaf,
    title: "Sustainable Farming",
    description: "Tools to track and improve your environmental impact",
  },
  {
    icon: LinkIcon,
    title: "Multi-Chain Support",
    description:
      "Seamlessly work with Hedera and Cardano blockchains for maximum flexibility",
  },
  {
    icon: Database,
    title: "Hedera HCS/HTS",
    description:
      "Leverage Hedera Consensus Service for immutable logging and Token Service for crop tokenization",
  },
  {
    icon: Coins,
    title: "Cardano Native Tokens",
    description:
      "Mint native tokens and attach transaction metadata for supply chain events",
  },
];
