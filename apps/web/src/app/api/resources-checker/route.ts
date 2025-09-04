import { NextRequest, NextResponse } from 'next/server'

// Client-side tool detection patterns
const toolPatterns = {
  'Google Analytics': {
    patterns: [
      /gtag\(/g,
      /google-analytics\.com\/analytics\.js/g,
      /googletagmanager\.com\/gtag\/js/g,
      /UA-\d+-\d+/g,
      /G-[A-Z0-9]+/g
    ],
    category: 'Analytics',
    description: 'Google Analytics tracking and measurement platform'
  },
  'Google Tag Manager': {
    patterns: [
      /googletagmanager\.com\/gtm\.js/g,
      /GTM-[A-Z0-9]+/g,
      /dataLayer/g
    ],
    category: 'Tag Management',
    description: 'Google Tag Manager for tag management and tracking'
  },
  'Facebook Pixel': {
    patterns: [
      /connect\.facebook\.net\/en_US\/fbevents\.js/g,
      /fbq\(/g,
      /facebook\.com\/tr/g
    ],
    category: 'Analytics',
    description: 'Facebook Pixel for conversion tracking and analytics'
  },
  'WordPress': {
    patterns: [
      /wp-content\/themes/g,
      /wp-content\/plugins/g,
      /wp-includes/g,
      /wp-json\/wp\/v2/g,
      /wordpress/g
    ],
    category: 'CMS',
    description: 'WordPress content management system'
  },
  'Elementor': {
    patterns: [
      /elementor/g,
      /elementor-frontend/g,
      /elementor-pro/g
    ],
    category: 'Page Builder',
    description: 'Elementor page builder for WordPress'
  },
  'jQuery': {
    patterns: [
      /jquery\.min\.js/g,
      /jquery\.js/g,
      /\$\(/g
    ],
    category: 'JavaScript Library',
    description: 'jQuery JavaScript library'
  },
  'Bootstrap': {
    patterns: [
      /bootstrap\.min\.css/g,
      /bootstrap\.min\.js/g,
      /bootstrap\.css/g,
      /bootstrap\.js/g
    ],
    category: 'CSS Framework',
    description: 'Bootstrap CSS framework'
  },
  'React': {
    patterns: [
      /react\.min\.js/g,
      /react\.js/g,
      /React\./g,
      /_reactInternalInstance/g
    ],
    category: 'JavaScript Framework',
    description: 'React JavaScript library for building user interfaces'
  },
  'Vue.js': {
    patterns: [
      /vue\.min\.js/g,
      /vue\.js/g,
      /Vue\./g,
      /__vue__/g
    ],
    category: 'JavaScript Framework',
    description: 'Vue.js progressive JavaScript framework'
  },
  'Angular': {
    patterns: [
      /angular\.min\.js/g,
      /angular\.js/g,
      /ng-/g,
      /angular\./g
    ],
    category: 'JavaScript Framework',
    description: 'Angular web application framework'
  },
  'Shopify': {
    patterns: [
      /shopify\.com/g,
      /cdn\.shopify\.com/g,
      /shopify-section/g,
      /shopify\.theme/g
    ],
    category: 'E-commerce',
    description: 'Shopify e-commerce platform'
  },
  'WooCommerce': {
    patterns: [
      /woocommerce/g,
      /wc-/g,
      /woocommerce\.js/g
    ],
    category: 'E-commerce',
    description: 'WooCommerce e-commerce plugin for WordPress'
  },
  'Google Fonts': {
    patterns: [
      /fonts\.googleapis\.com/g,
      /fonts\.gstatic\.com/g
    ],
    category: 'Font Script',
    description: 'Google Fonts web font service'
  },
  'Yoast SEO': {
    patterns: [
      /yoast/g,
      /yoast-seo/g,
      /yoast_/g
    ],
    category: 'SEO',
    description: 'Yoast SEO plugin for WordPress'
  },
  'Swiper': {
    patterns: [
      /swiper/g,
      /swiper\.min\.js/g,
      /swiper\.css/g
    ],
    category: 'JavaScript Library',
    description: 'Swiper modern mobile touch slider'
  }
}

async function detectTools(url: string) {
  try {
    // Fetch the website content using CORS proxy
    const response = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(url)}`)
    
    if (!response.ok) {
      throw new Error('Failed to fetch website content')
    }

    const data = await response.json()
    const htmlContent = data.contents

    if (!htmlContent) {
      throw new Error('No content received from website')
    }

    const detectedTools = []

    // Analyze each tool pattern
    for (const [toolName, toolData] of Object.entries(toolPatterns)) {
      const evidence = []
      let matchCount = 0

      // Check each pattern for this tool
      for (const pattern of toolData.patterns) {
        const matches = htmlContent.match(pattern)
        if (matches) {
          matchCount += matches.length
          evidence.push(...matches.slice(0, 3)) // Keep first 3 matches as evidence
        }
      }

      // If we found matches, add this tool
      if (matchCount > 0) {
        const confidence = Math.min(95, 60 + (matchCount * 10)) // Base confidence + matches

        detectedTools.push({
          id: toolName.toLowerCase().replace(/[^a-z0-9]/g, '_'),
          name: toolName,
          category: toolData.category,
          description: toolData.description,
          confidence,
          detection_methods: ['Script Analysis', 'HTML Content Analysis'],
          evidence: evidence.slice(0, 5) // Limit evidence to 5 items
        })
      }
    }

    return {
      status: 'success',
      tools_detected: detectedTools.length,
      tools: detectedTools
    }

  } catch (error) {
    console.error('Tool detection error:', error)
    return {
      status: 'error',
      tools_detected: 0,
      tools: [],
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json()
    
    if (!url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      )
    }

    // Validate URL format
    try {
      new URL(url)
    } catch {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      )
    }

    // Use client-side tool detection
    const result = await detectTools(url)
    
    if (result.status === 'error') {
      return NextResponse.json(
        { error: result.error || 'Failed to analyze website' },
        { status: 500 }
      )
    }

    return NextResponse.json(result)
    
  } catch (error) {
    console.error('Error in resources checker:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
