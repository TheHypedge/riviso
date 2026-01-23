# Riviso Design System

## 🎨 Visual Design Language

### Brand Identity
- **Primary Brand Color**: Blue (`#0ea5e9` / `blue-500`)
- **Typography**: System fonts (SF Pro, Segoe UI, Roboto)
- **Design Style**: Minimal, clean, executive-friendly
- **Philosophy**: Clarity over complexity, insights over data

---

## 🎯 Color Palette

### Primary Colors (Blues)
```
bg-blue-50   #eff6ff   Lightest background
bg-blue-100  #dbeafe   Subtle backgrounds
bg-blue-200  #bfdbfe   Borders, dividers
bg-blue-500  #3b82f6   Primary brand color
bg-blue-600  #2563eb   Primary hover/active
bg-blue-700  #1d4ed8   Dark accents
bg-blue-900  #1e3a8a   Darkest text
```

### Semantic Colors

**Success (Green)**
```
bg-green-50   #f0fdf4   Success backgrounds
bg-green-100  #dcfce7   Success badges
bg-green-600  #16a34a   Success text/icons
```

**Warning (Yellow)**
```
bg-yellow-50   #fefce8   Warning backgrounds
bg-yellow-100  #fef9c3   Warning badges
bg-yellow-600  #ca8a04   Warning text/icons
```

**Danger (Red)**
```
bg-red-50   #fef2f2   Error backgrounds
bg-red-100  #fee2e2   Error badges
bg-red-600  #dc2626   Error text/icons
```

**Neutral (Gray)**
```
bg-gray-50   #f9fafb   Page background
bg-gray-100  #f3f4f6   Card backgrounds
bg-gray-200  #e5e7eb   Borders
bg-gray-600  #4b5563   Secondary text
bg-gray-900  #111827   Primary text
```

---

## 📐 Spacing System

Based on **4px/8px grid**:

```
spacing-1:   4px   (0.25rem)
spacing-2:   8px   (0.5rem)   ✅ Base unit
spacing-3:   12px  (0.75rem)
spacing-4:   16px  (1rem)     ✅ Common padding
spacing-6:   24px  (1.5rem)   ✅ Card padding
spacing-8:   32px  (2rem)
spacing-12:  48px  (3rem)
spacing-16:  64px  (4rem)
spacing-20:  80px  (5rem)
```

**Usage Examples**:
- Button padding: `px-4 py-2` (16px × 8px)
- Card padding: `p-6` (24px)
- Section spacing: `space-y-6` (24px vertical gaps)
- Page margins: `max-w-7xl mx-auto px-4`

---

## 📝 Typography Scale

### Font Sizes
```
text-xs:    12px  (0.75rem)   Small labels, badges
text-sm:    14px  (0.875rem)  Secondary text, captions
text-base:  16px  (1rem)      Body text (default)
text-lg:    18px  (1.125rem)  Subtitles
text-xl:    20px  (1.25rem)   Section headers
text-2xl:   24px  (1.5rem)    Page subtitles
text-3xl:   30px  (1.875rem)  Page titles
text-4xl:   36px  (2.25rem)   Hero text
text-5xl:   48px  (3rem)      Large numbers, KPIs
text-6xl:   60px  (3.75rem)   Landing page hero
```

### Font Weights
```
font-normal:    400   Body text
font-medium:    500   Subtle emphasis
font-semibold:  600   Headings, labels
font-bold:      700   Strong emphasis, KPIs
```

### Line Heights
```
leading-tight:    1.25   Headings
leading-normal:   1.5    Body text (default)
leading-relaxed:  1.625  Long-form content
```

### Usage Examples

**Page Titles**:
```tsx
<h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
```

**Section Headers**:
```tsx
<h2 className="text-xl font-semibold text-gray-800">Recent Activity</h2>
```

**Body Text**:
```tsx
<p className="text-base text-gray-600">Description text here</p>
```

**KPI Numbers**:
```tsx
<div className="text-5xl font-bold text-gray-900">78</div>
```

---

## 🎯 Component Library

### 1. Buttons

**Variants**:

```tsx
// Primary (Blue)
<button className="btn btn-primary">
  Get Started
</button>

// Secondary (Gray)
<button className="btn btn-secondary">
  Cancel
</button>

// Ghost (Transparent)
<button className="btn btn-ghost">
  Learn More
</button>
```

**Sizes**:
```tsx
<button className="btn btn-sm">Small</button>
<button className="btn">Default</button>
<button className="btn btn-lg">Large</button>
```

**With Icons**:
```tsx
<button className="btn btn-primary">
  <Save className="w-5 h-5" />
  Save Changes
</button>
```

**States**:
```tsx
// Loading
<button className="btn btn-primary" disabled>
  <div className="spinner spinner-sm" />
  Loading...
</button>

// Disabled
<button className="btn btn-primary" disabled>
  Disabled
</button>
```

---

### 2. Cards

**Basic Card**:
```tsx
<div className="card">
  <div className="card-header">
    Card Title
  </div>
  <div className="card-body">
    Card content goes here
  </div>
</div>
```

**Hover Card**:
```tsx
<div className="card hover:shadow-lg transition-shadow cursor-pointer">
  <div className="p-6">
    Interactive card
  </div>
</div>
```

**KPI Card**:
```tsx
<div className="card p-6">
  <div className="flex items-center justify-between mb-4">
    <div className="p-3 bg-blue-100 rounded-lg">
      <TrendingUp className="w-6 h-6 text-blue-600" />
    </div>
    <div className="flex items-center gap-1 text-sm font-medium text-green-600">
      <TrendingUp className="w-4 h-4" />
      12.5%
    </div>
  </div>
  <h3 className="text-2xl font-bold text-gray-900">5,420</h3>
  <p className="text-sm text-gray-600 mt-1">Organic Traffic</p>
</div>
```

---

### 3. Badges

```tsx
// Success
<span className="badge badge-success">Completed</span>

// Warning
<span className="badge badge-warning">Pending</span>

// Danger
<span className="badge badge-danger">Critical</span>

// Info
<span className="badge badge-info">New</span>
```

---

### 4. Spinners / Loading States

```tsx
// Small spinner
<div className="spinner spinner-sm text-blue-600" />

// Medium spinner
<div className="spinner spinner-md text-blue-600" />

// Large spinner (page loading)
<div className="flex items-center justify-center h-64">
  <div className="spinner spinner-lg text-blue-600" />
</div>
```

---

### 5. Form Inputs

**Text Input**:
```tsx
<div>
  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
    Email Address
  </label>
  <input
    id="email"
    type="email"
    className="w-full px-4 py-2 border border-gray-300 rounded-lg 
               focus:ring-2 focus:ring-blue-500 focus:border-transparent"
    placeholder="you@example.com"
  />
</div>
```

**With Error**:
```tsx
<input
  className="w-full px-4 py-2 border border-red-300 rounded-lg 
             focus:ring-2 focus:ring-red-500"
/>
<p className="text-sm text-red-600 mt-1">This field is required</p>
```

---

### 6. Navigation Items

**Active State**:
```tsx
<Link
  href="/dashboard"
  className="flex items-center gap-3 px-4 py-3 rounded-lg 
             bg-blue-100 text-blue-600"
>
  <LayoutDashboard className="w-5 h-5" />
  <span className="font-medium">Dashboard</span>
</Link>
```

**Inactive State**:
```tsx
<Link
  href="/dashboard/seo"
  className="flex items-center gap-3 px-4 py-3 rounded-lg 
             text-gray-700 hover:bg-gray-100 transition-colors"
>
  <Search className="w-5 h-5" />
  <span className="font-medium">SEO Analysis</span>
</Link>
```

---

### 7. Trend Indicators

```tsx
// Positive trend
<div className="flex items-center gap-1 text-sm font-medium text-green-600">
  <TrendingUp className="w-4 h-4" />
  12.5%
</div>

// Negative trend
<div className="flex items-center gap-1 text-sm font-medium text-red-600">
  <TrendingDown className="w-4 h-4" />
  3.2%
</div>
```

---

### 8. Empty States

```tsx
<div className="text-center py-12">
  <Search className="w-16 h-16 mx-auto text-gray-400 mb-4" />
  <h3 className="text-lg font-medium text-gray-900 mb-2">
    No keywords yet
  </h3>
  <p className="text-gray-600 mb-4">
    Get started by adding your first keyword to track
  </p>
  <button className="btn btn-primary">
    Add Keywords
  </button>
</div>
```

---

### 9. Error Messages

```tsx
<div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
  <div className="flex items-start gap-2">
    <AlertCircle className="w-5 h-5 mt-0.5" />
    <div>
      <h4 className="font-semibold">Error</h4>
      <p className="text-sm">Something went wrong. Please try again.</p>
    </div>
  </div>
</div>
```

---

## 📱 Responsive Breakpoints

```javascript
sm:  640px   // Mobile landscape
md:  768px   // Tablet
lg:  1024px  // Desktop
xl:  1280px  // Large desktop
2xl: 1536px  // Extra large
```

### Grid Layouts

**1 → 2 → 4 columns**:
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
  {/* Cards */}
</div>
```

**1 → 2 columns**:
```tsx
<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
  {/* Charts */}
</div>
```

**Stack on mobile**:
```tsx
<div className="flex flex-col lg:flex-row gap-4">
  {/* Elements */}
</div>
```

---

## 🎯 Layout Patterns

### Page Container
```tsx
<main className="py-6">
  <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
    {children}
  </div>
</main>
```

### Section Spacing
```tsx
<div className="space-y-6">
  <Section1 />
  <Section2 />
  <Section3 />
</div>
```

### Flex Utilities
```tsx
// Space between (header with action)
<div className="flex items-center justify-between">
  <h1>Title</h1>
  <button>Action</button>
</div>

// Center content
<div className="flex items-center justify-center h-64">
  <Spinner />
</div>
```

---

## ♿ Accessibility Guidelines

### Color Contrast
- **Text on white**: Use `text-gray-900` or `text-gray-800` (WCAG AA)
- **Secondary text**: Use `text-gray-600` or `text-gray-700`
- **Disabled text**: Use `text-gray-400`

### Focus States
```tsx
<button className="focus:ring-2 focus:ring-blue-500 focus:outline-none">
  Button
</button>
```

### ARIA Labels
```tsx
<button aria-label="Close menu">
  <X className="w-6 h-6" />
</button>

<input
  aria-describedby="email-error"
  aria-invalid="true"
/>
<p id="email-error" role="alert">Invalid email</p>
```

### Semantic HTML
```tsx
// Good ✅
<main>
  <h1>Page Title</h1>
  <section>
    <h2>Section Title</h2>
  </section>
</main>

// Bad ❌
<div>
  <div className="text-3xl">Page Title</div>
  <div>
    <div className="text-xl">Section Title</div>
  </div>
</div>
```

---

## 🎨 Icon System

Using **Lucide React** (https://lucide.dev/)

### Common Icons
```tsx
import {
  LayoutDashboard,  // Dashboard
  Search,           // SEO
  TrendingUp,       // Keywords/growth
  Users,            // Competitors
  Target,           // CRO
  MessageSquare,    // AI Chat
  Settings,         // Settings
  AlertCircle,      // Errors
  CheckCircle,      // Success
  Info,             // Info
  X,                // Close
  Menu,             // Menu
  Send,             // Send message
  Sparkles,         // AI indicator
  LogOut,           // Logout
} from 'lucide-react';
```

### Icon Sizes
```tsx
className="w-4 h-4"   // Small (16px)
className="w-5 h-5"   // Default (20px)
className="w-6 h-6"   // Medium (24px)
className="w-8 h-8"   // Large (32px)
```

---

## 🚀 Animation & Transitions

### Hover Effects
```tsx
className="hover:bg-gray-100 transition-colors duration-200"
className="hover:shadow-lg transition-shadow duration-300"
className="hover:scale-105 transition-transform duration-200"
```

### Loading Animations
```tsx
className="animate-spin"    // Spinners
className="animate-pulse"   // Skeleton screens
className="animate-bounce"  // Attention grabber
```

### Slide-in Sidebar
```tsx
className={`transform transition-transform duration-300 ${
  sidebarOpen ? 'translate-x-0' : '-translate-x-full'
}`}
```

---

## ✅ Design Principles Checklist

✅ **Minimal**: Clean, uncluttered interfaces
✅ **Executive-Friendly**: Big numbers, clear trends
✅ **Insight-Focused**: Context over raw data
✅ **Responsive**: Works on all devices
✅ **Accessible**: WCAG AA compliant
✅ **Fast**: Optimized performance
✅ **Consistent**: Reusable components
✅ **Professional**: Enterprise-grade quality

---

**This design system ensures consistency across the entire Riviso platform!** 🎨
