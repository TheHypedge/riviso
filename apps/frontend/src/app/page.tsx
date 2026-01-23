import Link from 'next/link';
import { ArrowRight, BarChart3, Search, Users, Zap } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-blue-50">
      {/* Hero Section */}
      <header className="container mx-auto px-4 py-16">
        <nav className="flex justify-between items-center mb-16">
          <div className="text-2xl font-bold text-primary-600">Riviso</div>
          <div className="space-x-4">
            <Link href="/auth/login" className="btn btn-ghost">
              Login
            </Link>
            <Link href="/auth/register" className="btn btn-primary">
              Get Started
            </Link>
          </div>
        </nav>

        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            AI-Driven Growth Intelligence Platform
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Unify your SEO, competitor insights, and conversion data with AI-powered analysis. 
            Make data-driven decisions that accelerate growth.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/auth/register" className="btn btn-primary btn-lg">
              Start Free Trial <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
            <Link href="/demo" className="btn btn-secondary btn-lg">
              View Demo
            </Link>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">
          Everything You Need to Grow
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <FeatureCard
            icon={<Search className="w-8 h-8 text-primary-600" />}
            title="SEO Analysis"
            description="Comprehensive audits, keyword tracking, and SERP monitoring"
          />
          <FeatureCard
            icon={<Users className="w-8 h-8 text-primary-600" />}
            title="Competitor Intelligence"
            description="Track competitors, identify content gaps, and find opportunities"
          />
          <FeatureCard
            icon={<Zap className="w-8 h-8 text-primary-600" />}
            title="CRO Insights"
            description="AI-powered conversion optimization recommendations"
          />
          <FeatureCard
            icon={<BarChart3 className="w-8 h-8 text-primary-600" />}
            title="AI Chat Assistant"
            description="Ask questions about your data in natural language"
          />
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="bg-primary-600 rounded-2xl p-12 text-white">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Accelerate Your Growth?
          </h2>
          <p className="text-xl mb-8 text-primary-100">
            Join hundreds of businesses using AI to make better decisions
          </p>
          <Link href="/auth/register" className="btn bg-white text-primary-600 hover:bg-gray-100 btn-lg">
            Get Started Free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 border-t border-gray-200 mt-16">
        <div className="text-center text-gray-600">
          <p>&copy; 2026 Riviso. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="card">
      <div className="card-body text-center">
        <div className="flex justify-center mb-4">{icon}</div>
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-gray-600 text-sm">{description}</p>
      </div>
    </div>
  );
}
