'use client'

import { AlertCircle, ArrowUp, ArrowDown, Minus } from 'lucide-react'

interface Fix {
  rule_id: string
  title: string
  impact: 'high' | 'medium' | 'low'
  description: string
}

interface TopFixesProps {
  fixes: Fix[]
}

export function TopFixes({ fixes }: TopFixesProps) {
  const getImpactIcon = (impact: string) => {
    switch (impact) {
      case 'high':
        return <ArrowUp className="h-5 w-5 text-error-500" />
      case 'medium':
        return <Minus className="h-5 w-5 text-warning-500" />
      case 'low':
        return <ArrowDown className="h-5 w-5 text-success-500" />
      default:
        return <AlertCircle className="h-5 w-5 text-gray-500" />
    }
  }

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high':
        return 'text-error-600 bg-error-50 border-error-200'
      case 'medium':
        return 'text-warning-600 bg-warning-50 border-warning-200'
      case 'low':
        return 'text-success-600 bg-success-50 border-success-200'
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getImpactLabel = (impact: string) => {
    switch (impact) {
      case 'high':
        return 'High Impact'
      case 'medium':
        return 'Medium Impact'
      case 'low':
        return 'Low Impact'
      default:
        return 'Unknown Impact'
    }
  }

  if (fixes.length === 0) {
    return (
      <div className="card p-6 text-center">
        <div className="text-success-500 mb-4">
          <AlertCircle className="h-12 w-12 mx-auto" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Great Job!
        </h3>
        <p className="text-gray-600">
          No critical issues found. Your website is performing well!
        </p>
      </div>
    )
  }

  return (
    <div className="card">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Top Priority Fixes</h3>
        <p className="text-sm text-gray-600 mt-1">
          Focus on these issues first for maximum SEO impact
        </p>
      </div>
      
      <div className="divide-y divide-gray-200">
        {fixes.map((fix, index) => (
          <div key={fix.rule_id} className="p-6">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                  <span className="text-sm font-semibold text-primary-600">
                    {index + 1}
                  </span>
                </div>
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-2">
                  {getImpactIcon(fix.impact)}
                  <h4 className="text-lg font-semibold text-gray-900">
                    {fix.title}
                  </h4>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getImpactColor(fix.impact)}`}>
                    {getImpactLabel(fix.impact)}
                  </span>
                </div>
                
                <p className="text-gray-600 leading-relaxed">
                  {fix.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {fixes.length > 0 && (
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <AlertCircle className="h-4 w-4" />
            <span>
              Addressing these {fixes.length} issues could significantly improve your SEO performance.
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
