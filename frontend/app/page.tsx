import Link from "next/link";
import Image from "next/image";
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
  CheckCircle,
  ArrowRight,
  Play,
  Award,
  Target,
} from "lucide-react";

export default function LandingPage() {
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
              href="#testimonials"
              className="text-gray-600 hover:text-emerald-600 transition-colors"
            >
              Testimonials
            </a>
          </div>

          <div className="flex items-center space-x-4">
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
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-20">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
          <div className="lg:w-1/2">
            <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
              Modern Farming
              <span className="block bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
                Meets Blockchain
              </span>
            </h1>

            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Track, verify, and optimize your agricultural supply chain with
              our blockchain-powered ledger. Now with <strong>HarvestLedger</strong> — AI-powered 
              credit scoring that gives Kenya&apos;s smallholder farmers access to loans 
              without traditional credit histories.
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
            {/* Hero Image */}
            <div className="relative z-10 rounded-2xl overflow-hidden shadow-2xl">
              <Image
                src="/farm-photos/women tea farmers.svg"
                alt="Kenyan tea farmers working in the field"
                width={600}
                height={450}
                className="w-full h-auto object-cover"
                priority
              />
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
                $2.1M
              </div>
              <div className="text-gray-600">Crops Tracked</div>
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
                <CardTitle className="text-xl text-emerald-700">{feature.title}</CardTitle>
                <CardDescription className="text-lg">
                  {feature.description}
                </CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      {/* How HarvestLedger Works */}
      <section id="how-it-works" className="bg-gradient-to-br from-emerald-50 to-green-50 py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              From Farm Data to Loan Access
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              A transparent, AI-powered process that turns your farming success into creditworthiness
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {howItWorks.map((step, index) => (
              <div key={index} className="relative">
                <Card className="border-0 shadow-lg h-full bg-white">
                  <CardHeader>
                    <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-emerald-500 to-green-500 rounded-full text-white font-bold text-lg mb-4">
                      {index + 1}
                    </div>
                    <CardTitle className="text-lg">{step.title}</CardTitle>
                    <CardDescription className="text-sm">
                      {step.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm text-gray-600">
                      {step.details.map((detail, i) => (
                        <li key={i} className="flex items-start">
                          <span className="text-emerald-500 mr-2">•</span>
                          {detail}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HarvestLedger NFT Card Section */}
      <section className="container mx-auto px-6 py-20">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          <div className="lg:w-1/2">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Your Farm Performance = Your Credit Score
            </h2>
            <p className="text-xl text-gray-600 mb-6">
              Each farmer gets a Credit Score NFT that lives permanently on the Cardano 
              blockchain, updates every 90 days, and can be used to access decentralized loans.
            </p>
            <ul className="space-y-3 text-gray-600">
              <li className="flex items-start">
                <CheckCircle className="h-5 w-5 text-emerald-500 mr-3 mt-0.5" />
                <span>AI analyzes 30+ data points including satellite imagery, mobile money, and climate data</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-5 w-5 text-emerald-500 mr-3 mt-0.5" />
                <span>Transparent SHAP explanations stored on IPFS</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-5 w-5 text-emerald-500 mr-3 mt-0.5" />
                <span>Non-transferable NFT tied to your wallet</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-5 w-5 text-emerald-500 mr-3 mt-0.5" />
                <span>Only ~$0.17 per score update</span>
              </li>
            </ul>
          </div>
          
          <div className="lg:w-1/2">
            {/* Credit Score NFT Card */}
            <div className="bg-gradient-to-br from-emerald-900 to-green-800 rounded-2xl shadow-2xl p-8 border border-emerald-700 text-white">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-2">
                  <div className="w-10 h-10 bg-gradient-to-r from-amber-400 to-orange-500 rounded-lg flex items-center justify-center">
                    <Award className="h-6 w-6 text-white" />
                  </div>
                  <span className="font-bold text-lg">HarvestLedger NFT</span>
                </div>
                <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500">
                  Cardano
                </Badge>
              </div>
              
              <div className="text-center mb-6">
                <div className="text-6xl font-bold text-amber-400 mb-2">72</div>
                <div className="text-emerald-200">Credit Score / 100</div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-white/10 rounded-lg p-3">
                  <div className="text-emerald-300 text-sm">Risk Level</div>
                  <div className="font-semibold text-amber-300">Medium</div>
                </div>
                <div className="bg-white/10 rounded-lg p-3">
                  <div className="text-emerald-300 text-sm">Valid Until</div>
                  <div className="font-semibold">Jan 2026</div>
                </div>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex items-center text-emerald-200">
                  <CheckCircle className="h-4 w-4 mr-2 text-green-400" />
                  Cooperative member, improving NDVI
                </div>
                <div className="flex items-center text-emerald-200">
                  <CheckCircle className="h-4 w-4 mr-2 text-green-400" />
                  Good repayment history
                </div>
                <div className="flex items-center text-amber-200">
                  <Target className="h-4 w-4 mr-2 text-amber-400" />
                  Areas to improve: Farm size, rainfall
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/farm-photos/man and woman digging.svg"
            alt="Farmers working in the field"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-900/90 to-green-800/80" />
        </div>
        <div className="container mx-auto px-6 py-24 text-center relative z-10">
          <h2 className="text-4xl font-bold mb-4 text-white">
            Ready to Transform Your Farming Business?
          </h2>
          <p className="text-xl text-emerald-100 mb-8 max-w-2xl mx-auto">
            Join thousands of farmers who are already using HarvestLedger to
            optimize their operations, access credit, and increase profits.
          </p>
          <Button
            size="lg"
            className="bg-white text-emerald-600 hover:bg-gray-100 px-8 py-3 text-lg font-semibold"
            asChild
          >
            <Link href="/auth/signin?type=onboarding">
              Get Started Today
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
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

const howItWorks = [
  {
    title: "AI Credit Scoring",
    description: "Off-chain analysis using LightGBM",
    details: [
      "Satellite imagery (NDVI crop health)",
      "Mobile money transactions",
      "Asset ownership data",
      "Generates score 0-100 with SHAP explanations",
    ],
  },
  {
    title: "NFT Minting",
    description: "On-chain credit score storage",
    details: [
      "Authorized oracle mints Credit Score NFT",
      "Metadata stored on Cardano blockchain",
      "Full details on IPFS",
      "Non-transferable, tied to wallet",
    ],
  },
  {
    title: "Loan Access",
    description: "DeFi lending with smart contracts",
    details: [
      "Request loan using Score NFT",
      "DeFi pool validates score ≥ 65",
      "Plutus smart contract locks funds",
      "Milestone-based disbursement",
    ],
  },
  {
    title: "Score Updates",
    description: "Continuous improvement cycle",
    details: [
      "Payments tracked on-chain",
      "Good repayment = higher score",
      "New NFT minted, old one burned",
      "Builds permanent credit history",
    ],
  },
];

const features = [
  {
    title: "Smart Analytics",
    description: "Advanced insights into crop performance and market trends",
  },
  {
    title: "Blockchain Security",
    description: "Tamper-proof records on Hedera Hashgraph network",
  },
  {
    title: "Supply Chain Tracking",
    description: "Complete visibility from planting to distribution",
  },
  {
    title: "Stakeholder Management",
    description: "Connect with buyers, suppliers, and partners seamlessly",
  },
  {
    title: "Profit Optimization",
    description: "Data-driven recommendations to maximize your revenue",
  },
  {
    title: "Sustainable Farming",
    description: "Tools to track and improve your environmental impact",
  },
];
