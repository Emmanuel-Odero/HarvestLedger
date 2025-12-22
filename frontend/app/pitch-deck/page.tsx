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
  Users,
  TrendingUp,
  Coins,
  Database,
  Target,
  DollarSign,
  Calendar,
  MapPin,
  Award,
  Zap,
  Heart,
  Download,
  ExternalLink,
  ChevronRight,
  Building,
  Lightbulb,
  Rocket,
  Star,
} from "lucide-react";

export default function PitchDeckPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-green-50">
      {/* Navigation */}
      <nav className="container mx-auto px-6 py-4 border-b border-emerald-100">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-emerald-500 to-green-500 rounded-lg">
              <Leaf className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
              HarvestLedger
            </span>
          </Link>

          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Download PDF
            </Button>
            <Button
              className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700"
              asChild
            >
              <Link href="/dashboard">
                Dashboard
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </nav>
      {/* Hero Slide */}
      <section className="container mx-auto px-6 py-20">
        <div className="text-center max-w-4xl mx-auto">
          <Badge className="mb-6 bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-200 text-lg px-6 py-2">
            🌾 Project Catalyst Funding Proposal
          </Badge>

          <h1 className="text-6xl lg:text-7xl font-bold text-gray-900 leading-tight mb-6">
            HarvestLedger
            <span className="block bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
              Pitch Deck
            </span>
          </h1>

          <p className="text-2xl text-gray-600 mb-8 leading-relaxed">
            Revolutionizing Kenya's Organic Agriculture with Cardano Blockchain
            Technology
          </p>

          <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-8 mb-12">
            <div className="flex items-center text-lg text-gray-700">
              <Target className="mr-2 h-6 w-6 text-emerald-600" />
              <span className="font-semibold">$500,000 Funding Request</span>
            </div>
            <div className="flex items-center text-lg text-gray-700">
              <MapPin className="mr-2 h-6 w-6 text-emerald-600" />
              <span className="font-semibold">9 Kenyan Counties</span>
            </div>
            <div className="flex items-center text-lg text-gray-700">
              <Users className="mr-2 h-6 w-6 text-emerald-600" />
              <span className="font-semibold">1,000+ Farmers</span>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto">
            <Card className="border-2 border-emerald-200 shadow-lg">
              <CardHeader className="text-center">
                <div className="flex justify-center mb-3">
                  <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-emerald-500 to-green-500 rounded-lg">
                    <Leaf className="h-6 w-6 text-white" />
                  </div>
                </div>
                <CardTitle className="text-emerald-700">
                  Organic Focus
                </CardTitle>
                <CardDescription>
                  Indigenous vegetables & sustainable farming practices
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 border-blue-200 shadow-lg">
              <CardHeader className="text-center">
                <div className="flex justify-center mb-3">
                  <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg">
                    <Coins className="h-6 w-6 text-white" />
                  </div>
                </div>
                <CardTitle className="text-blue-700">Cardano Native</CardTitle>
                <CardDescription>
                  Aiken smart contracts, MeshJS integration, Blockfrost API
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 border-amber-200 shadow-lg">
              <CardHeader className="text-center">
                <div className="flex justify-center mb-3">
                  <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg">
                    <TrendingUp className="h-6 w-6 text-white" />
                  </div>
                </div>
                <CardTitle className="text-amber-700">High Impact</CardTitle>
                <CardDescription>
                  40-60% farmer income increase, 2,400% ROI projection
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Problem Statement */}
      <section className="bg-white border-y border-gray-100">
        <div className="container mx-auto px-6 py-20">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-red-100 text-red-700 border-red-200">
              🚨 The Problem
            </Badge>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Kenya's Agricultural Challenges
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Smallholder farmers face systemic barriers that limit their income
              and market access
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border-l-4 border-l-red-500 shadow-lg">
              <CardHeader>
                <CardTitle className="text-red-700 flex items-center">
                  <Shield className="mr-2 h-5 w-5" />
                  Transparency Gaps
                </CardTitle>
                <CardDescription className="text-base">
                  <strong>40%</strong> of "organic" products lack proper
                  certification
                  <br />
                  Limited traceability leads to consumer distrust
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-l-4 border-l-orange-500 shadow-lg">
              <CardHeader>
                <CardTitle className="text-orange-700 flex items-center">
                  <DollarSign className="mr-2 h-5 w-5" />
                  Financial Barriers
                </CardTitle>
                <CardDescription className="text-base">
                  <strong>25-35%</strong> interest rates for traditional loans
                  <br />
                  Only 15% of smallholders have access to formal credit
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-l-4 border-l-yellow-500 shadow-lg">
              <CardHeader>
                <CardTitle className="text-yellow-700 flex items-center">
                  <BarChart3 className="mr-2 h-5 w-5" />
                  Supply Chain Issues
                </CardTitle>
                <CardDescription className="text-base">
                  <strong>60%</strong> profit reduction due to intermediaries
                  <br />
                  30% post-harvest losses from poor logistics
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-l-4 border-l-green-500 shadow-lg">
              <CardHeader>
                <CardTitle className="text-green-700 flex items-center">
                  <Globe className="mr-2 h-5 w-5" />
                  Sustainability Gap
                </CardTitle>
                <CardDescription className="text-base">
                  <strong>$500-2000</strong> organic certification costs
                  <br />
                  Limited incentives for climate-smart practices
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>
      {/* Solution Overview */}
      <section className="bg-gradient-to-br from-emerald-50 to-green-50">
        <div className="container mx-auto px-6 py-20">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-emerald-100 text-emerald-700 border-emerald-200">
              💡 Our Solution
            </Badge>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Cardano-Powered Agricultural Revolution
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Comprehensive blockchain platform tailored for Kenya's organic
              farming ecosystem
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <Card className="border-2 border-emerald-200 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center text-emerald-700">
                    <Database className="mr-3 h-6 w-6" />
                    Immutable Supply Chain Tracking
                  </CardTitle>
                  <CardDescription className="text-base">
                    On-chain records using CIP-20 standards, verifiable by
                    consumers via QR codes. Complete traceability from seed to
                    shelf for all organic products.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="border-2 border-blue-200 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center text-blue-700">
                    <Coins className="mr-3 h-6 w-6" />
                    Native Token Ecosystem
                  </CardTitle>
                  <CardDescription className="text-base">
                    Crop tokens with rich metadata (certification, soil health,
                    harvest data). HARVEST utility tokens for governance and
                    platform rewards.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="border-2 border-purple-200 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center text-purple-700">
                    <Zap className="mr-3 h-6 w-6" />
                    DeFi Integration
                  </CardTitle>
                  <CardDescription className="text-base">
                    Aiken-powered lending using crop tokens as collateral. Yield
                    farming tied to organic harvests and carbon credits.
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>

            <div className="relative">
              <Card className="border-2 border-gray-200 shadow-2xl">
                <CardHeader className="bg-gradient-to-r from-emerald-500 to-green-500 text-white">
                  <CardTitle className="text-center text-2xl">
                    Cardano Technology Stack
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <span className="font-semibold text-blue-700">
                        Aiken Smart Contracts
                      </span>
                      <Badge className="bg-blue-100 text-blue-700">
                        Lending & Governance
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <span className="font-semibold text-green-700">
                        MeshJS Integration
                      </span>
                      <Badge className="bg-green-100 text-green-700">
                        Multi-Wallet Support
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                      <span className="font-semibold text-purple-700">
                        Blockfrost API
                      </span>
                      <Badge className="bg-purple-100 text-purple-700">
                        Real-time Data
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
                      <span className="font-semibold text-amber-700">
                        Native Tokens
                      </span>
                      <Badge className="bg-amber-100 text-amber-700">
                        No Smart Contracts
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Market Opportunity */}
      <section className="bg-white">
        <div className="container mx-auto px-6 py-20">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-blue-100 text-blue-700 border-blue-200">
              📊 Market Opportunity
            </Badge>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Massive Market Potential
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Kenya's agricultural sector presents significant opportunities for
              blockchain innovation
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <Card className="text-center border-2 border-emerald-200 shadow-lg">
              <CardHeader>
                <div className="text-4xl font-bold text-emerald-600 mb-2">
                  $5.2B
                </div>
                <CardTitle className="text-emerald-700">
                  Total Addressable Market
                </CardTitle>
                <CardDescription>
                  Kenya's agricultural sector with 20% annual organic export
                  growth
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="text-center border-2 border-blue-200 shadow-lg">
              <CardHeader>
                <div className="text-4xl font-bold text-blue-600 mb-2">
                  $100M
                </div>
                <CardTitle className="text-blue-700">
                  Serviceable Market
                </CardTitle>
                <CardDescription>
                  Blockchain in Kenyan agtech with 15% annual digital adoption
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="text-center border-2 border-purple-200 shadow-lg">
              <CardHeader>
                <div className="text-4xl font-bold text-purple-600 mb-2">
                  $1M
                </div>
                <CardTitle className="text-purple-700">
                  5-Year Revenue Goal
                </CardTitle>
                <CardDescription>
                  0.5% market capture across organic tea, horticulture, and
                  indigenous vegetables
                </CardDescription>
              </CardHeader>
            </Card>
          </div>

          <div className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-2xl p-8">
            <h3 className="text-2xl font-bold text-center text-gray-900 mb-8">
              Target Market Segments
            </h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-emerald-600 mb-2">
                  $500M
                </div>
                <div className="font-semibold text-gray-700">Organic Tea</div>
                <div className="text-sm text-gray-600">
                  Kericho, Bomet, Nandi
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600 mb-2">
                  $400M
                </div>
                <div className="font-semibold text-gray-700">
                  Horticulture Exports
                </div>
                <div className="text-sm text-gray-600">Nakuru, Kisii</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 mb-2">
                  $50M
                </div>
                <div className="font-semibold text-gray-700">
                  Indigenous Vegetables
                </div>
                <div className="text-sm text-gray-600">All pilot counties</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-amber-600 mb-2">
                  $200M
                </div>
                <div className="font-semibold text-gray-700">
                  Smallholder Finance
                </div>
                <div className="text-sm text-gray-600">
                  Credit gap opportunity
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Pilot Counties & Crops */}
      <section className="bg-gradient-to-br from-green-50 to-emerald-50">
        <div className="container mx-auto px-6 py-20">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-green-100 text-green-700 border-green-200">
              🗺️ Pilot Program
            </Badge>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              9 Strategic Counties in Kenya
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Targeting diverse agricultural landscapes with focus on indigenous
              vegetables and organic farming
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {pilotCounties.map((county, index) => (
              <Card
                key={index}
                className="border-2 border-green-200 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <CardHeader>
                  <CardTitle className="flex items-center text-green-700">
                    <MapPin className="mr-2 h-5 w-5" />
                    {county.name}
                  </CardTitle>
                  <CardDescription className="text-base">
                    <div className="space-y-2">
                      <div>
                        <strong>Key Crops:</strong> {county.crops}
                      </div>
                      <div>
                        <strong>Indigenous Vegetables:</strong>{" "}
                        {county.indigenous}
                      </div>
                    </div>
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>

          <Card className="border-2 border-emerald-300 shadow-xl bg-gradient-to-r from-emerald-50 to-green-50">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl text-emerald-700 mb-4">
                Indigenous Vegetables Focus
              </CardTitle>
              <CardDescription className="text-lg text-gray-700">
                <div className="grid md:grid-cols-2 gap-4 text-left">
                  <div>
                    <strong>High-Value Varieties:</strong>
                    <ul className="mt-2 space-y-1 text-sm">
                      <li>• Terere (amaranth) - high protein</li>
                      <li>• Managu (African nightshade) - calcium-rich</li>
                      <li>• Mrenda (jute mallow) - mucilaginous</li>
                      <li>• Nduma (arrowroot) - gluten-free staple</li>
                    </ul>
                  </div>
                  <div>
                    <strong>Market Benefits:</strong>
                    <ul className="mt-2 space-y-1 text-sm">
                      <li>• 40-80% premium pricing in urban markets</li>
                      <li>• Growing export demand for African vegetables</li>
                      <li>• Supports traditional knowledge preservation</li>
                      <li>• Promotes biodiversity and food security</li>
                    </ul>
                  </div>
                </div>
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* Business Model & Financials */}
      <section className="bg-white">
        <div className="container mx-auto px-6 py-20">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-purple-100 text-purple-700 border-purple-200">
              💰 Business Model
            </Badge>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Sustainable Revenue & Growth
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Multiple revenue streams with strong unit economics and scalable
              growth model
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                Revenue Streams
              </h3>
              <div className="space-y-4">
                <Card className="border-l-4 border-l-emerald-500">
                  <CardHeader>
                    <CardTitle className="text-emerald-700">
                      Transaction Fees (0.5%)
                    </CardTitle>
                    <CardDescription>
                      Commission on token transfers and marketplace trades
                    </CardDescription>
                  </CardHeader>
                </Card>
                <Card className="border-l-4 border-l-blue-500">
                  <CardHeader>
                    <CardTitle className="text-blue-700">
                      Certification Services ($50-200)
                    </CardTitle>
                    <CardDescription>
                      Organic certification and verification services
                    </CardDescription>
                  </CardHeader>
                </Card>
                <Card className="border-l-4 border-l-purple-500">
                  <CardHeader>
                    <CardTitle className="text-purple-700">
                      DeFi Protocol Fees (1-3%)
                    </CardTitle>
                    <CardDescription>
                      Interest spread on agricultural loans and yield farming
                    </CardDescription>
                  </CardHeader>
                </Card>
                <Card className="border-l-4 border-l-amber-500">
                  <CardHeader>
                    <CardTitle className="text-amber-700">
                      Carbon Credit Facilitation (10%)
                    </CardTitle>
                    <CardDescription>
                      Commission on carbon credit trading and verification
                    </CardDescription>
                  </CardHeader>
                </Card>
              </div>
            </div>

            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                5-Year Financial Projections
              </h3>
              <Card className="border-2 border-gray-200 shadow-lg">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {financialProjections.map((year, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="font-semibold text-gray-700">
                          {year.year}
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-emerald-600">
                            {year.revenue}
                          </div>
                          <div className="text-sm text-gray-600">
                            {year.farmers} farmers
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 pt-4 border-t border-gray-200">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-gray-700">
                        Break-even:
                      </span>
                      <span className="font-bold text-green-600">Month 18</span>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <span className="font-semibold text-gray-700">
                        Projected ROI:
                      </span>
                      <span className="font-bold text-green-600">
                        2,400% over 5 years
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="container mx-auto px-6 py-20">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-blue-100 text-blue-700 border-blue-200">
              👥 Our Team
            </Badge>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Experienced Leadership
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Combining blockchain expertise with deep agricultural knowledge
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {teamMembers.map((member, index) => (
              <Card
                key={index}
                className="border-2 border-blue-200 shadow-lg text-center"
              >
                <CardHeader>
                  <div className="flex justify-center mb-4">
                    <div className="flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full text-white text-2xl font-bold">
                      {member.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </div>
                  </div>
                  <CardTitle className="text-xl text-blue-700">
                    {member.name}
                  </CardTitle>
                  <CardDescription className="text-base">
                    <div className="font-semibold text-gray-700 mb-2">
                      {member.role}
                    </div>
                    <div className="text-sm text-gray-600">
                      {member.experience}
                    </div>
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>
      {/* Funding Request */}
      <section className="bg-gradient-to-r from-emerald-600 to-green-600 text-white">
        <div className="container mx-auto px-6 py-20">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-white/20 text-white border-white/30">
              💎 Funding Request
            </Badge>
            <h2 className="text-4xl font-bold mb-4">
              $500,000 Project Catalyst Funding
            </h2>
            <p className="text-xl text-emerald-100 max-w-3xl mx-auto">
              12-month development and deployment across 9 Kenyan counties
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <Card className="bg-white/10 border-white/20 text-white">
              <CardHeader className="text-center">
                <div className="text-3xl font-bold mb-2">40%</div>
                <CardTitle className="text-lg">Development</CardTitle>
                <CardDescription className="text-emerald-100">
                  $200K - Aiken contracts, MeshJS integration, Blockfrost API
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-white/10 border-white/20 text-white">
              <CardHeader className="text-center">
                <div className="text-3xl font-bold mb-2">30%</div>
                <CardTitle className="text-lg">Farmer Onboarding</CardTitle>
                <CardDescription className="text-emerald-100">
                  $150K - Training, coordinators, equipment, localization
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-white/10 border-white/20 text-white">
              <CardHeader className="text-center">
                <div className="text-3xl font-bold mb-2">20%</div>
                <CardTitle className="text-lg">Marketing</CardTitle>
                <CardDescription className="text-emerald-100">
                  $100K - Partnerships, digital marketing, conferences
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-white/10 border-white/20 text-white">
              <CardHeader className="text-center">
                <div className="text-3xl font-bold mb-2">10%</div>
                <CardTitle className="text-lg">Operations</CardTitle>
                <CardDescription className="text-emerald-100">
                  $50K - Legal compliance, infrastructure, admin
                </CardDescription>
              </CardHeader>
            </Card>
          </div>

          <div className="bg-white/10 rounded-2xl p-8 backdrop-blur-sm">
            <h3 className="text-2xl font-bold text-center mb-8">
              Milestone-Based Fund Release
            </h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {milestones.map((milestone, index) => (
                <div key={index} className="text-center">
                  <div className="flex items-center justify-center w-16 h-16 bg-white/20 rounded-full text-2xl font-bold mb-4 mx-auto">
                    {milestone.month}M
                  </div>
                  <div className="font-semibold text-lg mb-2">
                    {milestone.percentage}
                  </div>
                  <div className="text-sm text-emerald-100">
                    {milestone.deliverables}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Success Metrics */}
      <section className="bg-white">
        <div className="container mx-auto px-6 py-20">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-green-100 text-green-700 border-green-200">
              📈 Success Metrics
            </Badge>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Measurable Impact Goals
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Clear, quantifiable objectives for platform adoption and farmer
              impact
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-2 border-emerald-200 shadow-lg">
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-r from-emerald-500 to-green-500 rounded-full">
                    <Users className="h-8 w-8 text-white" />
                  </div>
                </div>
                <CardTitle className="text-emerald-700 text-xl mb-4">
                  Adoption Metrics
                </CardTitle>
                <div className="space-y-3 text-left">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Registered Farmers</span>
                    <span className="font-bold text-emerald-600">1,000+</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tracked Products</span>
                    <span className="font-bold text-emerald-600">50,000+</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">App Downloads</span>
                    <span className="font-bold text-emerald-600">10,000+</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Cooperative Partners</span>
                    <span className="font-bold text-emerald-600">100+</span>
                  </div>
                </div>
              </CardHeader>
            </Card>

            <Card className="border-2 border-blue-200 shadow-lg">
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full">
                    <DollarSign className="h-8 w-8 text-white" />
                  </div>
                </div>
                <CardTitle className="text-blue-700 text-xl mb-4">
                  Financial Metrics
                </CardTitle>
                <div className="space-y-3 text-left">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tokenized Crops</span>
                    <span className="font-bold text-blue-600">$500K+</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Loans Facilitated</span>
                    <span className="font-bold text-blue-600">$100K+</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Platform Revenue</span>
                    <span className="font-bold text-blue-600">$50K+</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Loan Repayment Rate</span>
                    <span className="font-bold text-blue-600">95%+</span>
                  </div>
                </div>
              </CardHeader>
            </Card>

            <Card className="border-2 border-purple-200 shadow-lg">
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full">
                    <Heart className="h-8 w-8 text-white" />
                  </div>
                </div>
                <CardTitle className="text-purple-700 text-xl mb-4">
                  Impact Metrics
                </CardTitle>
                <div className="space-y-3 text-left">
                  <div className="flex justify-between">
                    <span className="text-gray-600">
                      Farmer Income Increase
                    </span>
                    <span className="font-bold text-purple-600">40%+</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Transparency Score</span>
                    <span className="font-bold text-purple-600">95%+</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Fraud Reduction</span>
                    <span className="font-bold text-purple-600">80%+</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Carbon Credits Earned</span>
                    <span className="font-bold text-purple-600">$50K+</span>
                  </div>
                </div>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-gradient-to-br from-emerald-600 via-green-600 to-teal-600 text-white">
        <div className="container mx-auto px-6 py-20 text-center">
          <Badge className="mb-6 bg-white/20 text-white border-white/30 text-lg px-6 py-2">
            🚀 Ready to Transform Agriculture
          </Badge>

          <h2 className="text-5xl font-bold mb-6">
            Join the Agricultural Revolution
          </h2>

          <p className="text-xl text-emerald-100 mb-8 max-w-3xl mx-auto leading-relaxed">
            Support HarvestLedger through Project Catalyst and help us empower
            1,000+ Kenyan farmers with blockchain technology, organic
            certification, and sustainable income growth.
          </p>

          <div className="grid md:grid-cols-3 gap-8 mb-12 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="flex items-center justify-center w-16 h-16 bg-white/20 rounded-full backdrop-blur-sm">
                  <Rocket className="h-8 w-8 text-white" />
                </div>
              </div>
              <h3 className="text-xl font-bold mb-2">Innovation</h3>
              <p className="text-emerald-100">
                First Cardano-native agricultural platform in Kenya
              </p>
            </div>
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="flex items-center justify-center w-16 h-16 bg-white/20 rounded-full backdrop-blur-sm">
                  <Heart className="h-8 w-8 text-white" />
                </div>
              </div>
              <h3 className="text-xl font-bold mb-2">Impact</h3>
              <p className="text-emerald-100">
                Empowering smallholder farmers and preserving indigenous crops
              </p>
            </div>
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="flex items-center justify-center w-16 h-16 bg-white/20 rounded-full backdrop-blur-sm">
                  <Star className="h-8 w-8 text-white" />
                </div>
              </div>
              <h3 className="text-xl font-bold mb-2">Excellence</h3>
              <p className="text-emerald-100">
                Proven team with deep agricultural and blockchain expertise
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-6">
            <Button
              size="lg"
              className="bg-white text-emerald-600 hover:bg-gray-100 px-8 py-4 text-lg font-semibold"
              asChild
            >
              <Link
                href="https://github.com/Emmanuel-Odero/HarvestLedger"
                target="_blank"
              >
                <ExternalLink className="mr-2 h-5 w-5" />
                View on GitHub
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-emerald-600 px-8 py-4 text-lg font-semibold"
              asChild
            >
              <Link href="/dashboard">
                <ChevronRight className="mr-2 h-5 w-5" />
                Try Platform
              </Link>
            </Button>
          </div>

          <div className="mt-12 pt-8 border-t border-white/20">
            <p className="text-emerald-100 text-lg">
              <strong>Contact:</strong> team@harvestledger.io |
              <strong> Twitter:</strong> @HarvestLedger |
              <strong> Location:</strong> Nairobi, Kenya
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
// Data arrays for the pitch deck
const pilotCounties = [
  {
    name: "Nakuru",
    crops: "Potatoes, wheat, horticulture, dairy",
    indigenous: "Terere, managu, kunde, sukuma wiki",
  },
  {
    name: "Homa Bay",
    crops: "Maize, sorghum, cassava, fruits",
    indigenous: "Osuga, mrenda, nduma, rabuon",
  },
  {
    name: "Kisumu",
    crops: "Rice, sugarcane, maize",
    indigenous: "Saget, mitoo, kahurura, mchicha",
  },
  {
    name: "Kisii",
    crops: "Tea, bananas, avocados",
    indigenous: "Derema, thafai, rabuon, bosibori",
  },
  {
    name: "Nyahururu",
    crops: "Potatoes, carrots, peas, dairy",
    indigenous: "Ngwaci, mchicha, terere variants",
  },
  {
    name: "Bomet",
    crops: "Tea, maize, potatoes",
    indigenous: "Bosibori, nyanchoka, kerubo",
  },
  {
    name: "Kericho",
    crops: "Premium tea, coffee, pineapples",
    indigenous: "Mochere, nyambeki, obara",
  },
  {
    name: "Nandi",
    crops: "Tea, coffee, sugarcane, maize",
    indigenous: "Buyaki, slenderleaf, dek, shamala",
  },
  {
    name: "Bungoma",
    crops: "Maize, coffee, bananas, sugarcane",
    indigenous: "Lubembe, shamala, imali, mrenda",
  },
];

const financialProjections = [
  { year: "2026", revenue: "$125,000", farmers: "1,000" },
  { year: "2027", revenue: "$750,000", farmers: "5,000" },
  { year: "2028", revenue: "$2,500,000", farmers: "15,000" },
  { year: "2029", revenue: "$6,000,000", farmers: "35,000" },
  { year: "2030", revenue: "$12,000,000", farmers: "75,000" },
];

const teamMembers = [
  {
    name: "Emmanuel Odero",
    role: "CTO",
    experience:
      "8+ years blockchain development, MSc Computer Science, University of Nairobi",
  },
  {
    name: "Peter Maina",
    role: "Blockchain Developer & Project Manager",
    experience: "Cardano/Aiken specialist, 5+ years agtech project management",
  },
  {
    name: "Kalondu Muema",
    role: "UI/UX Developer & Client Satisfaction Officer",
    experience: "Mobile-first design expert, emerging markets specialist",
  },
];

const milestones = [
  {
    month: 3,
    percentage: "25% - $125K",
    deliverables: "Aiken contracts, testnet deployment, 50 farmers onboarded",
  },
  {
    month: 6,
    percentage: "35% - $175K",
    deliverables:
      "Mainnet launch, mobile app, 500 farmers, Blockfrost integration",
  },
  {
    month: 9,
    percentage: "25% - $125K",
    deliverables:
      "DeFi platform, 9 counties, 10K transactions, carbon marketplace",
  },
  {
    month: 12,
    percentage: "15% - $75K",
    deliverables:
      "1,000 farmers, $100K loans, sustainability metrics, Series A prep",
  },
];
