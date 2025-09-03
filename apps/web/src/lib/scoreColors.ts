export interface ScoreColor {
  text: string
  bg: string
  border: string
  ring: string
}

export function getScoreColor(score: number): ScoreColor {
  if (score >= 90) {
    return {
      text: 'text-success-600',
      bg: 'bg-success-50',
      border: 'border-success-200',
      ring: 'ring-success-500',
    }
  }
  
  if (score >= 70) {
    return {
      text: 'text-success-500',
      bg: 'bg-success-50',
      border: 'border-success-200',
      ring: 'ring-success-400',
    }
  }
  
  if (score >= 50) {
    return {
      text: 'text-warning-600',
      bg: 'bg-warning-50',
      border: 'border-warning-200',
      ring: 'ring-warning-500',
    }
  }
  
  return {
    text: 'text-error-600',
    bg: 'bg-error-50',
    border: 'border-error-200',
    ring: 'ring-error-500',
  }
}

export function getScoreLabel(score: number): string {
  if (score >= 90) return 'Excellent'
  if (score >= 70) return 'Good'
  if (score >= 50) return 'Fair'
  return 'Poor'
}

export function getScoreDescription(score: number): string {
  if (score >= 90) return 'Outstanding performance with minimal issues'
  if (score >= 70) return 'Good performance with some room for improvement'
  if (score >= 50) return 'Average performance with several areas to address'
  return 'Poor performance requiring immediate attention'
}

export function getScoreIcon(score: number): string {
  if (score >= 90) return '🎉'
  if (score >= 70) return '👍'
  if (score >= 50) return '⚠️'
  return '🚨'
}
