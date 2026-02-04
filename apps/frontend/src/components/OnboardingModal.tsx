'use client';

import { useState } from 'react';
import { api } from '@/lib/api';
import { authService } from '@/lib/auth';
import {
  Globe,
  Search,
  BarChart3,
  Sparkles,
  ArrowRight,
  CheckCircle,
  Loader,
  X,
} from 'lucide-react';

interface OnboardingModalProps {
  onComplete: () => void;
  onSkip: () => void;
}

const steps = [
  {
    id: 1,
    title: 'Welcome to Riviso!',
    description: 'Your all-in-one SEO and website analytics platform. Let us help you improve your online presence.',
    icon: Sparkles,
    color: 'from-purple-500 to-pink-500',
  },
  {
    id: 2,
    title: 'Connect Your Website',
    description: 'Add your website to start tracking SEO performance, analyze content, and get AI-powered recommendations.',
    icon: Globe,
    color: 'from-blue-500 to-cyan-500',
  },
  {
    id: 3,
    title: 'Get Search Insights',
    description: 'Connect Google Search Console to unlock detailed search analytics, keyword rankings, and click-through rates.',
    icon: Search,
    color: 'from-green-500 to-emerald-500',
  },
  {
    id: 4,
    title: 'Analyze & Improve',
    description: 'Use our Website Analyzer to identify SEO issues, get actionable recommendations, and track your progress.',
    icon: BarChart3,
    color: 'from-orange-500 to-red-500',
  },
];

export default function OnboardingModal({ onComplete, onSkip }: OnboardingModalProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [completing, setCompleting] = useState(false);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    setCompleting(true);
    try {
      await api.post('/v1/users/me/complete-onboarding');
      authService.updateStoredUser({ onboardingCompleted: true });
      onComplete();
    } catch (err) {
      console.error('Failed to complete onboarding:', err);
      // Complete anyway on error
      onComplete();
    } finally {
      setCompleting(false);
    }
  };

  const step = steps[currentStep];
  const Icon = step.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden">
        {/* Skip button */}
        <button
          onClick={onSkip}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Progress bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-slate-100">
          <div
            className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-300"
            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          />
        </div>

        {/* Content */}
        <div className="p-8 pt-12">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className={`p-4 rounded-2xl bg-gradient-to-br ${step.color} shadow-lg shadow-purple-500/30`}>
              <Icon className="w-10 h-10 text-white" />
            </div>
          </div>

          {/* Step content */}
          <div className="text-center mb-8">
            <div className="text-sm font-medium text-slate-500 mb-2">
              Step {currentStep + 1} of {steps.length}
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-3">{step.title}</h2>
            <p className="text-slate-600">{step.description}</p>
          </div>

          {/* Features list on last step */}
          {currentStep === steps.length - 1 && (
            <div className="bg-slate-50 rounded-xl p-4 mb-6 space-y-3">
              {['Track keyword rankings', 'Identify SEO issues', 'Get AI recommendations', 'Monitor traffic trends'].map((feature, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-sm text-slate-700">{feature}</span>
                </div>
              ))}
            </div>
          )}

          {/* Step indicators */}
          <div className="flex justify-center gap-2 mb-6">
            {steps.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentStep(idx)}
                className={`w-2.5 h-2.5 rounded-full transition-all ${
                  idx === currentStep
                    ? 'bg-purple-600 w-8'
                    : idx < currentStep
                    ? 'bg-purple-300'
                    : 'bg-slate-200'
                }`}
              />
            ))}
          </div>

          {/* Action buttons */}
          <div className="flex gap-3">
            {currentStep > 0 && (
              <button
                onClick={handlePrevious}
                className="flex-1 px-6 py-3 border-2 border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition-colors"
              >
                Previous
              </button>
            )}
            {currentStep < steps.length - 1 ? (
              <button
                onClick={handleNext}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg shadow-purple-500/30 flex items-center justify-center gap-2"
              >
                Next
                <ArrowRight className="w-5 h-5" />
              </button>
            ) : (
              <button
                onClick={handleComplete}
                disabled={completing}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg shadow-purple-500/30 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {completing ? (
                  <Loader className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    Get Started
                    <Sparkles className="w-5 h-5" />
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
