'use client';

type Size = 'sm' | 'md' | 'lg' | 'xl';

const SIZE_MAP: Record<Size, { outer: number; stroke: number; fontSize: string }> = {
  sm: { outer: 56, stroke: 4, fontSize: 'text-sm' },
  md: { outer: 80, stroke: 5, fontSize: 'text-base' },
  lg: { outer: 120, stroke: 6, fontSize: 'text-xl' },
  xl: { outer: 160, stroke: 8, fontSize: 'text-3xl' },
};

function getStrokeColor(score: number, max: number): string {
  const pct = max > 0 ? (score / max) * 100 : 0;
  if (pct >= 70) return 'stroke-emerald-500';
  if (pct >= 40) return 'stroke-amber-500';
  return 'stroke-rose-500';
}

function getBgStrokeColor(score: number, max: number): string {
  const pct = max > 0 ? (score / max) * 100 : 0;
  if (pct >= 70) return 'stroke-emerald-100';
  if (pct >= 40) return 'stroke-amber-100';
  return 'stroke-rose-100';
}

export type CircularProgressVariant = 'default' | 'light';

export interface CircularProgressProps {
  /** Value (e.g. score). */
  value: number;
  /** Max value (default 100). */
  max?: number;
  /** Size variant. */
  size?: Size;
  /** Label below the value (e.g. "SEO Score"). */
  label?: string;
  /** Optional sublabel or unit. */
  sublabel?: string;
  /** Override stroke color (e.g. "stroke-indigo-500"). */
  strokeColor?: string;
  /** Use on dark backgrounds: light text and optional light stroke. */
  variant?: CircularProgressVariant;
  /** Show value inside (default true). */
  showValue?: boolean;
  /** Additional class for the wrapper. */
  className?: string;
}

export function CircularProgress({
  value,
  max = 100,
  size = 'md',
  label,
  sublabel,
  strokeColor,
  variant = 'default',
  showValue = true,
  className = '',
}: CircularProgressProps) {
  const { outer, stroke, fontSize } = SIZE_MAP[size];
  const r = (outer - stroke) / 2;
  const cx = outer / 2;
  const cy = outer / 2;
  const circumference = 2 * Math.PI * r;
  const pct = Math.min(100, max > 0 ? (value / max) * 100 : 0);
  const strokeDash = (pct / 100) * circumference;
  const isLight = variant === 'light';
  const strokeColorClass = strokeColor ?? (isLight ? 'stroke-white' : getStrokeColor(value, max));
  const bgColorClass = strokeColor ? 'stroke-gray-100' : isLight ? 'stroke-white/20' : getBgStrokeColor(value, max);
  const valueClass = isLight ? 'text-white' : 'text-gray-900';
  const sublabelClass = isLight ? 'text-indigo-200' : 'text-gray-500';
  const labelClass = isLight ? 'text-indigo-200/90' : 'text-gray-600';

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div className="relative inline-flex" style={{ width: outer, height: outer }}>
        <svg width={outer} height={outer} className="transform -rotate-90" aria-hidden>
          <circle
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            strokeWidth={stroke}
            className={bgColorClass}
            strokeLinecap="round"
          />
          <circle
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            strokeWidth={stroke}
            className={`${strokeColorClass} transition-all duration-700 ease-out`}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference - strokeDash}
          />
        </svg>
        {showValue && (
          <div
            className="absolute inset-0 flex flex-col items-center justify-center"
            style={{ margin: stroke }}
          >
            <span className={`font-bold ${valueClass} ${fontSize}`}>
              {Math.round(value)}
            </span>
            {sublabel && (
              <span className={`text-[10px] sm:text-xs ${sublabelClass} mt-0.5`}>{sublabel}</span>
            )}
          </div>
        )}
      </div>
      {label && (
        <span className={`text-xs sm:text-sm font-medium ${labelClass} mt-2 text-center`}>
          {label}
        </span>
      )}
    </div>
  );
}
