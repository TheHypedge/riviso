'use client'

import { useState } from 'react'
import { ChevronDown, ChevronRight, CheckCircle, XCircle, AlertTriangle } from 'lucide-react'

interface Rule {
  id: string
  name: string
  category: string
  status: 'pass' | 'fail' | 'warning'
  score: number
  message: string
  evidence?: string
}

interface RuleTableProps {
  rules: Rule[]
}

export function RuleTable({ rules }: RuleTableProps) {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())

  const toggleRow = (ruleId: string) => {
    const newExpanded = new Set(expandedRows)
    if (newExpanded.has(ruleId)) {
      newExpanded.delete(ruleId)
    } else {
      newExpanded.add(ruleId)
    }
    setExpandedRows(newExpanded)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass':
        return <CheckCircle className="h-5 w-5 text-success-500" />
      case 'fail':
        return <XCircle className="h-5 w-5 text-error-500" />
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-warning-500" />
      default:
        return null
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pass':
        return 'text-success-600 bg-success-50'
      case 'fail':
        return 'text-error-600 bg-error-50'
      case 'warning':
        return 'text-warning-600 bg-warning-50'
      default:
        return 'text-gray-600 bg-gray-50'
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-success-600'
    if (score >= 70) return 'text-success-500'
    if (score >= 50) return 'text-warning-600'
    return 'text-error-600'
  }

  const groupedRules = rules.reduce((acc, rule) => {
    if (!acc[rule.category]) {
      acc[rule.category] = []
    }
    acc[rule.category].push(rule)
    return acc
  }, {} as Record<string, Rule[]>)

  return (
    <div className="card">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">SEO Rules Analysis</h3>
        <p className="text-sm text-gray-600 mt-1">
          Detailed breakdown of all SEO checks performed
        </p>
      </div>
      
      <div className="divide-y divide-gray-200">
        {Object.entries(groupedRules).map(([category, categoryRules]) => (
          <div key={category}>
            <div className="px-6 py-3 bg-gray-50">
              <h4 className="font-medium text-gray-900 capitalize">{category}</h4>
            </div>
            
            {categoryRules.map((rule) => {
              const isExpanded = expandedRows.has(rule.id)
              
              return (
                <div key={rule.id} className="border-b border-gray-100 last:border-b-0">
                  <div
                    className="px-6 py-4 hover:bg-gray-50 cursor-pointer"
                    onClick={() => toggleRow(rule.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4 text-gray-400" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-gray-400" />
                        )}
                        {getStatusIcon(rule.status)}
                        <div>
                          <h5 className="font-medium text-gray-900">{rule.name}</h5>
                          <p className="text-sm text-gray-600">{rule.message}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(rule.status)}`}>
                          {rule.status}
                        </span>
                        <span className={`font-semibold ${getScoreColor(rule.score)}`}>
                          {rule.score}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {isExpanded && rule.evidence && (
                    <div className="px-6 pb-4 bg-gray-50">
                      <div className="pl-7">
                        <h6 className="text-sm font-medium text-gray-700 mb-2">Evidence:</h6>
                        <div className="bg-white p-3 rounded-md border border-gray-200">
                          <pre className="text-sm text-gray-600 whitespace-pre-wrap font-mono">
                            {rule.evidence}
                          </pre>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}
