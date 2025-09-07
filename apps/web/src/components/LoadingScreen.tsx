'use client'

import { useState, useEffect } from 'react'
import { Loader2, TrendingUp, Target, Zap, Globe, Users, BarChart3, Search } from 'lucide-react'

const seoFacts = [
  {
    icon: TrendingUp,
    title: "Website Speed Impact",
    fact: "A 1-second delay in page load time can result in a 7% reduction in conversions.",
    color: "text-blue-600"
  },
  {
    icon: Target,
    title: "Mobile First",
    fact: "Google uses mobile-first indexing, meaning your mobile site performance directly affects your search rankings.",
    color: "text-green-600"
  },
  {
    icon: Zap,
    title: "Core Web Vitals",
    fact: "Google's Core Web Vitals (LCP, FID, CLS) are now official ranking factors in search results.",
    color: "text-orange-600"
  },
  {
    icon: Globe,
    title: "SEO ROI",
    fact: "SEO generates 1000% more traffic than organic social media, with 14.6% average conversion rate.",
    color: "text-purple-600"
  },
  {
    icon: Users,
    title: "User Experience",
    fact: "53% of mobile users abandon sites that take longer than 3 seconds to load.",
    color: "text-red-600"
  },
  {
    icon: BarChart3,
    title: "Content Quality",
    fact: "Long-form content (2000+ words) gets 77% more backlinks than shorter content.",
    color: "text-indigo-600"
  },
  {
    icon: Search,
    title: "Local SEO",
    fact: "46% of all Google searches are local, making local SEO crucial for businesses.",
    color: "text-teal-600"
  }
]

interface LoadingScreenProps {
  url: string
  progress?: number
}

export function LoadingScreen({ url, progress = 0 }: LoadingScreenProps) {
  const [currentFactIndex, setCurrentFactIndex] = useState(0)
  const [dots, setDots] = useState('')
  const [currentStep, setCurrentStep] = useState(0)
  const [dynamicProgress, setDynamicProgress] = useState(0)
  const [stepProgress, setStepProgress] = useState(0)

  const analysisSteps = [
    { 
      name: "Initializing Analysis", 
      icon: Search, 
      color: "text-blue-600",
      duration: 2000,
      description: "Setting up analysis environment and validating URL"
    },
    { 
      name: "Fetching Page Data", 
      icon: Globe, 
      color: "text-green-600",
      duration: 3000,
      description: "Downloading page content and analyzing structure"
    },
    { 
      name: "Testing Performance", 
      icon: Zap, 
      color: "text-orange-600",
      duration: 4000,
      description: "Running Core Web Vitals and speed tests"
    },
    { 
      name: "Analyzing SEO", 
      icon: BarChart3, 
      color: "text-purple-600",
      duration: 3000,
      description: "Checking technical SEO and content optimization"
    },
    { 
      name: "Generating Report", 
      icon: Target, 
      color: "text-indigo-600",
      duration: 2000,
      description: "Compiling results and creating comprehensive report"
    }
  ]

  useEffect(() => {
    const factInterval = setInterval(() => {
      setCurrentFactIndex((prev) => (prev + 1) % seoFacts.length)
    }, 4000)

    const dotsInterval = setInterval(() => {
      setDots((prev) => {
        if (prev === '...') return ''
        return prev + '.'
      })
    }, 500)

    // Dynamic progress simulation
    const progressInterval = setInterval(() => {
      setDynamicProgress((prev) => {
        if (prev >= 100) return 100
        
        // Calculate current step based on progress
        const totalDuration = analysisSteps.reduce((sum, step) => sum + step.duration, 0)
        const currentStepIndex = Math.min(Math.floor((prev / 100) * analysisSteps.length), analysisSteps.length - 1)
        const currentStepData = analysisSteps[currentStepIndex]
        
        // Calculate progress within current step
        const stepStartProgress = (currentStepIndex / analysisSteps.length) * 100
        const stepEndProgress = ((currentStepIndex + 1) / analysisSteps.length) * 100
        const stepProgress = ((prev - stepStartProgress) / (stepEndProgress - stepStartProgress)) * 100
        
        setStepProgress(stepProgress)
        setCurrentStep(currentStepIndex)
        
        // Increment progress based on current step duration
        const increment = (currentStepData.duration / totalDuration) * 2
        return Math.min(prev + increment, 100)
      })
    }, 100)

    return () => {
      clearInterval(factInterval)
      clearInterval(dotsInterval)
      clearInterval(progressInterval)
    }
  }, [])

  const currentFact = seoFacts[currentFactIndex]
  const IconComponent = currentFact.icon
  const currentStepData = analysisSteps[currentStep]
  const StepIcon = currentStepData.icon

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center">
              <Loader2 className="h-8 w-8 text-white animate-spin" />
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Analyzing Your Website
          </h1>
          <p className="text-lg text-gray-600 mb-2">
            We're running a comprehensive SEO audit for:
          </p>
          <div className="inline-flex items-center px-4 py-2 bg-white rounded-lg shadow-sm border border-gray-200">
            <Globe className="h-4 w-4 text-primary-600 mr-2" />
            <span className="font-medium text-gray-900">{url}</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-700">Analysis Progress</span>
            <span className="text-sm text-gray-500">{Math.round(dynamicProgress)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 relative overflow-hidden">
            <div 
              className="bg-gradient-to-r from-primary-600 to-secondary-500 h-3 rounded-full transition-all duration-500 ease-out relative"
              style={{ width: `${Math.min(dynamicProgress, 100)}%` }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-pulse"></div>
            </div>
          </div>
          
          {/* Step Progress Indicator */}
          <div className="mt-4">
            <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
              <span>Step {currentStep + 1} of {analysisSteps.length}</span>
              <span>{Math.round(stepProgress)}% complete</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-1">
              <div 
                className="bg-gradient-to-r from-blue-500 to-green-500 h-1 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(stepProgress, 100)}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Current Analysis Step */}
        <div className="text-center mb-8">
          <div className="inline-flex flex-col items-center px-6 py-4 bg-white rounded-xl shadow-sm border border-gray-200 max-w-md">
            <div className="flex items-center mb-2">
              <StepIcon className={`h-5 w-5 mr-3 ${currentStepData.color} ${dynamicProgress < 100 ? 'animate-pulse' : ''}`} />
              <span className="text-lg font-medium text-gray-900">
                {currentStepData.name}{dots}
              </span>
            </div>
            <p className="text-sm text-gray-600 text-center">
              {currentStepData.description}
            </p>
          </div>
        </div>

        {/* SEO Fact */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 mb-8">
          <div className="flex items-start space-x-4">
            <div className={`w-12 h-12 bg-gray-50 rounded-lg flex items-center justify-center ${currentFact.color}`}>
              <IconComponent className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {currentFact.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {currentFact.fact}
              </p>
            </div>
          </div>
        </div>

        {/* Analysis Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Search className="h-6 w-6 text-blue-600" />
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">Page Analysis</h4>
            <p className="text-sm text-gray-600">Scanning page structure, content, and metadata</p>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Zap className="h-6 w-6 text-green-600" />
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">Performance Test</h4>
            <p className="text-sm text-gray-600">Measuring Core Web Vitals and loading speed</p>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-center">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <BarChart3 className="h-6 w-6 text-orange-600" />
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">SEO Audit</h4>
            <p className="text-sm text-gray-600">Checking technical SEO and content quality</p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-500">
            {dynamicProgress < 100 
              ? `Analyzing your website with real-time data from multiple sources${dots}`
              : "Finalizing your comprehensive SEO report..."
            }
          </p>
          {dynamicProgress < 100 && (
            <p className="text-xs text-gray-400 mt-2">
              Estimated time remaining: {Math.max(0, Math.round((100 - dynamicProgress) / 2))} seconds
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
