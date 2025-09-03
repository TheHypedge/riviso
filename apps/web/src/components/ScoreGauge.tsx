'use client'

import { CircularProgressbar, buildStyles } from 'react-circular-progressbar'
import 'react-circular-progressbar/dist/styles.css'

interface ScoreGaugeProps {
  title: string
  score: number
  color: 'primary' | 'success' | 'warning' | 'error'
}

export function ScoreGauge({ title, score, color }: ScoreGaugeProps) {
  const getColorClasses = (color: string) => {
    switch (color) {
      case 'primary':
        return {
          path: '#3b82f6',
          trail: '#e5e7eb',
          text: '#1e40af',
        }
      case 'success':
        return {
          path: '#22c55e',
          trail: '#e5e7eb',
          text: '#15803d',
        }
      case 'warning':
        return {
          path: '#f59e0b',
          trail: '#e5e7eb',
          text: '#b45309',
        }
      case 'error':
        return {
          path: '#ef4444',
          trail: '#e5e7eb',
          text: '#b91c1c',
        }
      default:
        return {
          path: '#6b7280',
          trail: '#e5e7eb',
          text: '#374151',
        }
    }
  }

  const getScoreLabel = (score: number) => {
    if (score >= 90) return 'Excellent'
    if (score >= 70) return 'Good'
    if (score >= 50) return 'Fair'
    return 'Poor'
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-success-600'
    if (score >= 70) return 'text-success-500'
    if (score >= 50) return 'text-warning-600'
    return 'text-error-600'
  }

  const colors = getColorClasses(color)

  return (
    <div className="card p-6 text-center">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      <div className="relative w-32 h-32 mx-auto mb-4">
        <CircularProgressbar
          value={score}
          text={`${score}`}
          styles={buildStyles({
            pathColor: colors.path,
            trailColor: colors.trail,
            textColor: colors.text,
            textSize: '24px',
            fontWeight: 'bold',
          })}
        />
      </div>
      <p className={`text-sm font-medium ${getScoreColor(score)}`}>
        {getScoreLabel(score)}
      </p>
    </div>
  )
}
