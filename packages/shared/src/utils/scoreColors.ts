/**
 * Utility functions for score-based color coding
 */

export type ScoreLevel = 'excellent' | 'good' | 'fair' | 'poor' | 'critical';

export interface ScoreColor {
  bg: string;
  text: string;
  border: string;
  ring: string;
}

/**
 * Get score level based on numeric score
 */
export function getScoreLevel(score: number): ScoreLevel {
  if (score >= 90) return 'excellent';
  if (score >= 70) return 'good';
  if (score >= 50) return 'fair';
  if (score >= 30) return 'poor';
  return 'critical';
}

/**
 * Get color scheme for score level
 */
export function getScoreColors(level: ScoreLevel): ScoreColor {
  const colors: Record<ScoreLevel, ScoreColor> = {
    excellent: {
      bg: 'bg-green-50',
      text: 'text-green-800',
      border: 'border-green-200',
      ring: 'ring-green-500',
    },
    good: {
      bg: 'bg-blue-50',
      text: 'text-blue-800',
      border: 'border-blue-200',
      ring: 'ring-blue-500',
    },
    fair: {
      bg: 'bg-yellow-50',
      text: 'text-yellow-800',
      border: 'border-yellow-200',
      ring: 'ring-yellow-500',
    },
    poor: {
      bg: 'bg-orange-50',
      text: 'text-orange-800',
      border: 'border-orange-200',
      ring: 'ring-orange-500',
    },
    critical: {
      bg: 'bg-red-50',
      text: 'text-red-800',
      border: 'border-red-200',
      ring: 'ring-red-500',
    },
  };

  return colors[level];
}

/**
 * Get color scheme for numeric score
 */
export function getScoreColorsForValue(score: number): ScoreColor {
  return getScoreColors(getScoreLevel(score));
}

/**
 * Get progress bar color class
 */
export function getProgressBarColor(score: number): string {
  const level = getScoreLevel(score);
  const colors: Record<ScoreLevel, string> = {
    excellent: 'bg-green-500',
    good: 'bg-blue-500',
    fair: 'bg-yellow-500',
    poor: 'bg-orange-500',
    critical: 'bg-red-500',
  };
  return colors[level];
}

/**
 * Get score label
 */
export function getScoreLabel(score: number): string {
  const level = getScoreLevel(score);
  const labels: Record<ScoreLevel, string> = {
    excellent: 'Excellent',
    good: 'Good',
    fair: 'Fair',
    poor: 'Poor',
    critical: 'Critical',
  };
  return labels[level];
}

/**
 * Get severity color scheme
 */
export function getSeverityColors(severity: 'error' | 'warning' | 'info'): ScoreColor {
  const colors: Record<'error' | 'warning' | 'info', ScoreColor> = {
    error: {
      bg: 'bg-red-50',
      text: 'text-red-800',
      border: 'border-red-200',
      ring: 'ring-red-500',
    },
    warning: {
      bg: 'bg-yellow-50',
      text: 'text-yellow-800',
      border: 'border-yellow-200',
      ring: 'ring-yellow-500',
    },
    info: {
      bg: 'bg-blue-50',
      text: 'text-blue-800',
      border: 'border-blue-200',
      ring: 'ring-blue-500',
    },
  };
  return colors[severity];
}

/**
 * Get impact color scheme
 */
export function getImpactColors(impact: 'high' | 'medium' | 'low'): ScoreColor {
  const colors: Record<'high' | 'medium' | 'low', ScoreColor> = {
    high: {
      bg: 'bg-red-50',
      text: 'text-red-800',
      border: 'border-red-200',
      ring: 'ring-red-500',
    },
    medium: {
      bg: 'bg-yellow-50',
      text: 'text-yellow-800',
      border: 'border-yellow-200',
      ring: 'ring-yellow-500',
    },
    low: {
      bg: 'bg-green-50',
      text: 'text-green-800',
      border: 'border-green-200',
      ring: 'ring-green-500',
    },
  };
  return colors[impact];
}

