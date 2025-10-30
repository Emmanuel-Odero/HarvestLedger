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
              <Link href="/login">Sign In</Link>
            </Button>
            <Button
              className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700"
              asChild
            >
              <Link href="/register">
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-20">
        <div className="flex flex-col lg:flex-row items-center justify-between">
          <div className="lg:w-1/2 mb-12 lg:mb-0">
            <Badge className="mb-4 bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-200">
              🚀 Revolutionizing Agriculture
            </Badge>

            <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
              Modern Farming
              <span className="block bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
                Meets Blockchain
              </span>
            </h1>

            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Track, verify, and optimize your agricultural supply chain with
              our blockchain-powered ledger. Ensure transparency from seed to
              shelf while maximizing your profits.
            </p>

            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              <Button
                size="lg"
                className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white px-8 py-3 text-lg"
                asChild
              >
                <Link href="/register">
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

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-emerald-600 to-green-600 text-white">
        <div className="container mx-auto px-6 py-20 text-center">
          <h2 className="text-4xl font-bold mb-4">
            Ready to Transform Your Farming Business?
          </h2>
          <p className="text-xl text-emerald-100 mb-8 max-w-2xl mx-auto">
            Join thousands of farmers who are already using HarvestLedger to
            optimize their operations and increase profits.
          </p>
          <Button
            size="lg"
            className="bg-white text-emerald-600 hover:bg-gray-100 px-8 py-3 text-lg font-semibold"
            asChild
          >
            <Link href="/register">
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
];
