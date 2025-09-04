import { NextRequest, NextResponse } from 'next/server'

// Comprehensive tool detection patterns based on Wappalyzer methodology
const toolPatterns = {
  // Analytics & Tracking
  'Google Analytics': {
    patterns: [
      { type: 'script', pattern: /google-analytics\.com\/analytics\.js/ },
      { type: 'script', pattern: /googletagmanager\.com\/gtag\/js/ },
      { type: 'script', pattern: /gtag\(/ },
      { type: 'script', pattern: /ga\(/ },
      { type: 'script', pattern: /_gaq\.push/ },
      { type: 'script', pattern: /UA-\d+-\d+/ },
      { type: 'script', pattern: /G-[A-Z0-9]+/ },
      { type: 'meta', pattern: /google-site-verification/ },
      { type: 'cookie', pattern: /_ga/ }
    ],
    category: 'Analytics',
    description: 'Google Analytics tracking and measurement platform',
    confidence: 90
  },
  'Google Tag Manager': {
    patterns: [
      { type: 'script', pattern: /googletagmanager\.com\/gtm\.js/ },
      { type: 'script', pattern: /GTM-[A-Z0-9]+/ },
      { type: 'script', pattern: /dataLayer/ },
      { type: 'script', pattern: /gtm\(/ }
    ],
    category: 'Tag Management',
    description: 'Google Tag Manager for tag management and tracking',
    confidence: 95
  },
  'Facebook Pixel': {
    patterns: [
      { type: 'script', pattern: /connect\.facebook\.net\/en_US\/fbevents\.js/ },
      { type: 'script', pattern: /fbq\(/ },
      { type: 'script', pattern: /facebook\.com\/tr/ },
      { type: 'script', pattern: /facebook\.net\/tr/ }
    ],
    category: 'Analytics',
    description: 'Facebook Pixel for conversion tracking and analytics',
    confidence: 90
  },
  'Google Ads': {
    patterns: [
      { type: 'script', pattern: /googletagservices\.com/ },
      { type: 'script', pattern: /googleadservices\.com/ },
      { type: 'script', pattern: /doubleclick\.net/ },
      { type: 'script', pattern: /googlesyndication\.com/ }
    ],
    category: 'Advertising',
    description: 'Google Ads advertising platform',
    confidence: 85
  },
  'Hotjar': {
    patterns: [
      { type: 'script', pattern: /static\.hotjar\.com/ },
      { type: 'script', pattern: /hotjar/ },
      { type: 'script', pattern: /hj\(/ }
    ],
    category: 'Analytics',
    description: 'Hotjar user behavior analytics',
    confidence: 90
  },
  'Mixpanel': {
    patterns: [
      { type: 'script', pattern: /cdn\.mxpnl\.com/ },
      { type: 'script', pattern: /mixpanel/ }
    ],
    category: 'Analytics',
    description: 'Mixpanel product analytics',
    confidence: 85
  },

  // CMS & Platforms
  'WordPress': {
    patterns: [
      { type: 'script', pattern: /wp-content\/themes/ },
      { type: 'script', pattern: /wp-content\/plugins/ },
      { type: 'script', pattern: /wp-includes/ },
      { type: 'script', pattern: /wp-json\/wp\/v2/ },
      { type: 'meta', pattern: /generator.*wordpress/i },
      { type: 'script', pattern: /wp-emoji/ },
      { type: 'script', pattern: /wp-embed/ }
    ],
    category: 'CMS',
    description: 'WordPress content management system',
    confidence: 95
  },
  'Drupal': {
    patterns: [
      { type: 'script', pattern: /sites\/all\/modules/ },
      { type: 'script', pattern: /sites\/default\/files/ },
      { type: 'meta', pattern: /generator.*drupal/i },
      { type: 'script', pattern: /drupal/ }
    ],
    category: 'CMS',
    description: 'Drupal content management system',
    confidence: 90
  },
  'Joomla': {
    patterns: [
      { type: 'script', pattern: /media\/system\/js/ },
      { type: 'script', pattern: /templates\/system/ },
      { type: 'meta', pattern: /generator.*joomla/i },
      { type: 'script', pattern: /joomla/ }
    ],
    category: 'CMS',
    description: 'Joomla content management system',
    confidence: 90
  },
  'Shopify': {
    patterns: [
      { type: 'script', pattern: /cdn\.shopify\.com/ },
      { type: 'script', pattern: /shopify\.com/ },
      { type: 'script', pattern: /shopify-section/ },
      { type: 'script', pattern: /shopify\.theme/ },
      { type: 'meta', pattern: /shopify/ }
    ],
    category: 'E-commerce',
    description: 'Shopify e-commerce platform',
    confidence: 95
  },
  'WooCommerce': {
    patterns: [
      { type: 'script', pattern: /woocommerce/ },
      { type: 'script', pattern: /wc-/ },
      { type: 'script', pattern: /woocommerce\.js/ },
      { type: 'script', pattern: /wp-content\/plugins\/woocommerce/ }
    ],
    category: 'E-commerce',
    description: 'WooCommerce e-commerce plugin for WordPress',
    confidence: 90
  },
  'Magento': {
    patterns: [
      { type: 'script', pattern: /magento/ },
      { type: 'script', pattern: /skin\/frontend/ },
      { type: 'script', pattern: /js\/mage/ },
      { type: 'meta', pattern: /generator.*magento/i }
    ],
    category: 'E-commerce',
    description: 'Magento e-commerce platform',
    confidence: 90
  },

  // JavaScript Frameworks & Libraries
  'jQuery': {
    patterns: [
      { type: 'script', pattern: /jquery\.min\.js/ },
      { type: 'script', pattern: /jquery\.js/ },
      { type: 'script', pattern: /jquery/ },
      { type: 'script', pattern: /\$\(/ },
      { type: 'script', pattern: /jQuery/ }
    ],
    category: 'JavaScript Library',
    description: 'jQuery JavaScript library',
    confidence: 85
  },
  'React': {
    patterns: [
      { type: 'script', pattern: /react\.min\.js/ },
      { type: 'script', pattern: /react\.js/ },
      { type: 'script', pattern: /React\./ },
      { type: 'script', pattern: /_reactInternalInstance/ },
      { type: 'script', pattern: /react-dom/ }
    ],
    category: 'JavaScript Framework',
    description: 'React JavaScript library for building user interfaces',
    confidence: 90
  },
  'Vue.js': {
    patterns: [
      { type: 'script', pattern: /vue\.min\.js/ },
      { type: 'script', pattern: /vue\.js/ },
      { type: 'script', pattern: /Vue\./ },
      { type: 'script', pattern: /__vue__/ },
      { type: 'script', pattern: /vue-router/ }
    ],
    category: 'JavaScript Framework',
    description: 'Vue.js progressive JavaScript framework',
    confidence: 90
  },
  'Angular': {
    patterns: [
      { type: 'script', pattern: /angular\.min\.js/ },
      { type: 'script', pattern: /angular\.js/ },
      { type: 'script', pattern: /ng-/ },
      { type: 'script', pattern: /angular\./ },
      { type: 'script', pattern: /angular-ui/ }
    ],
    category: 'JavaScript Framework',
    description: 'Angular web application framework',
    confidence: 90
  },
  'Bootstrap': {
    patterns: [
      { type: 'script', pattern: /bootstrap\.min\.css/ },
      { type: 'script', pattern: /bootstrap\.min\.js/ },
      { type: 'script', pattern: /bootstrap\.css/ },
      { type: 'script', pattern: /bootstrap\.js/ },
      { type: 'script', pattern: /bootstrap/ }
    ],
    category: 'CSS Framework',
    description: 'Bootstrap CSS framework',
    confidence: 85
  },
  'Swiper': {
    patterns: [
      { type: 'script', pattern: /swiper\.min\.js/ },
      { type: 'script', pattern: /swiper\.css/ },
      { type: 'script', pattern: /swiper/ }
    ],
    category: 'JavaScript Library',
    description: 'Swiper modern mobile touch slider',
    confidence: 90
  },

  // Page Builders & Tools
  'Elementor': {
    patterns: [
      { type: 'script', pattern: /elementor/ },
      { type: 'script', pattern: /elementor-frontend/ },
      { type: 'script', pattern: /elementor-pro/ },
      { type: 'script', pattern: /elementor\.js/ }
    ],
    category: 'Page Builder',
    description: 'Elementor page builder for WordPress',
    confidence: 95
  },
  'Divi': {
    patterns: [
      { type: 'script', pattern: /divi/ },
      { type: 'script', pattern: /et_pb/ },
      { type: 'script', pattern: /divi\.js/ }
    ],
    category: 'Page Builder',
    description: 'Divi page builder for WordPress',
    confidence: 90
  },
  'Beaver Builder': {
    patterns: [
      { type: 'script', pattern: /beaver-builder/ },
      { type: 'script', pattern: /fl-builder/ },
      { type: 'script', pattern: /beaver/ }
    ],
    category: 'Page Builder',
    description: 'Beaver Builder page builder for WordPress',
    confidence: 85
  },

  // SEO Tools
  'Yoast SEO': {
    patterns: [
      { type: 'script', pattern: /yoast/ },
      { type: 'script', pattern: /yoast-seo/ },
      { type: 'script', pattern: /yoast_/ },
      { type: 'meta', pattern: /yoast/ }
    ],
    category: 'SEO',
    description: 'Yoast SEO plugin for WordPress',
    confidence: 90
  },
  'RankMath': {
    patterns: [
      { type: 'script', pattern: /rankmath/ },
      { type: 'script', pattern: /rank-math/ },
      { type: 'meta', pattern: /rankmath/ }
    ],
    category: 'SEO',
    description: 'RankMath SEO plugin for WordPress',
    confidence: 85
  },
  'All in One SEO': {
    patterns: [
      { type: 'script', pattern: /aioseo/ },
      { type: 'script', pattern: /all-in-one-seo/ },
      { type: 'meta', pattern: /aioseo/ }
    ],
    category: 'SEO',
    description: 'All in One SEO plugin for WordPress',
    confidence: 85
  },

  // Fonts & CDN
  'Google Fonts': {
    patterns: [
      { type: 'script', pattern: /fonts\.googleapis\.com/ },
      { type: 'script', pattern: /fonts\.gstatic\.com/ },
      { type: 'link', pattern: /fonts\.googleapis\.com/ }
    ],
    category: 'Font Script',
    description: 'Google Fonts web font service',
    confidence: 90
  },
  'Font Awesome': {
    patterns: [
      { type: 'script', pattern: /fontawesome/ },
      { type: 'script', pattern: /font-awesome/ },
      { type: 'link', pattern: /fontawesome/ }
    ],
    category: 'Font Script',
    description: 'Font Awesome icon font',
    confidence: 85
  },

  // CDN & Performance
  'Cloudflare': {
    patterns: [
      { type: 'script', pattern: /cloudflare/ },
      { type: 'meta', pattern: /cloudflare/ },
      { type: 'header', pattern: /cf-ray/ }
    ],
    category: 'CDN',
    description: 'Cloudflare CDN and security service',
    confidence: 80
  },
  'MaxCDN': {
    patterns: [
      { type: 'script', pattern: /maxcdn/ },
      { type: 'script', pattern: /bootstrapcdn/ }
    ],
    category: 'CDN',
    description: 'MaxCDN content delivery network',
    confidence: 80
  },

  // Marketing & Conversion
  'Mailchimp': {
    patterns: [
      { type: 'script', pattern: /mailchimp/ },
      { type: 'script', pattern: /mc\.us/ },
      { type: 'script', pattern: /list-manage\.com/ }
    ],
    category: 'Marketing',
    description: 'Mailchimp email marketing platform',
    confidence: 85
  },
  'HubSpot': {
    patterns: [
      { type: 'script', pattern: /hs-scripts\.com/ },
      { type: 'script', pattern: /hubspot/ },
      { type: 'script', pattern: /hs-/ }
    ],
    category: 'Marketing',
    description: 'HubSpot marketing and sales platform',
    confidence: 85
  },
  'ConvertKit': {
    patterns: [
      { type: 'script', pattern: /convertkit/ },
      { type: 'script', pattern: /ck\.js/ }
    ],
    category: 'Marketing',
    description: 'ConvertKit email marketing platform',
    confidence: 80
  },

  // Additional tools from Wappalyzer screenshots
  'OWL Carousel': {
    patterns: [
      { type: 'script', pattern: /owl\.carousel/ },
      { type: 'script', pattern: /owl-carousel/ },
      { type: 'link', pattern: /owl\.carousel/ }
    ],
    category: 'JavaScript Library',
    description: 'OWL Carousel touch slider library',
    confidence: 90
  },
  'jQuery Migrate': {
    patterns: [
      { type: 'script', pattern: /jquery-migrate/ },
      { type: 'script', pattern: /jquery\.migrate/ }
    ],
    category: 'JavaScript Library',
    description: 'jQuery Migrate compatibility library',
    confidence: 85
  },
  'LiteSpeed': {
    patterns: [
      { type: 'header', pattern: /server: litespeed/i },
      { type: 'header', pattern: /x-litespeed-cache/i },
      { type: 'script', pattern: /litespeed/ }
    ],
    category: 'Web Server',
    description: 'LiteSpeed web server',
    confidence: 80
  },
  'Hostinger': {
    patterns: [
      { type: 'header', pattern: /server:.*hostinger/i },
      { type: 'script', pattern: /hostinger/ },
      { type: 'meta', pattern: /hostinger/ }
    ],
    category: 'Hosting',
    description: 'Hostinger web hosting service',
    confidence: 80
  },
  'jsDelivr': {
    patterns: [
      { type: 'script', pattern: /cdn\.jsdelivr\.net/ },
      { type: 'link', pattern: /cdn\.jsdelivr\.net/ }
    ],
    category: 'CDN',
    description: 'jsDelivr CDN for open source projects',
    confidence: 90
  },
  'Hostinger CDN': {
    patterns: [
      { type: 'script', pattern: /hostinger-cdn/ },
      { type: 'link', pattern: /hostinger-cdn/ }
    ],
    category: 'CDN',
    description: 'Hostinger CDN service',
    confidence: 85
  },
  'PHP': {
    patterns: [
      { type: 'header', pattern: /x-powered-by: php/i },
      { type: 'script', pattern: /\.php/ },
      { type: 'meta', pattern: /generator.*php/i }
    ],
    category: 'Programming Language',
    description: 'PHP server-side programming language',
    confidence: 80
  },
  'MySQL': {
    patterns: [
      { type: 'script', pattern: /mysql/ },
      { type: 'meta', pattern: /mysql/ },
      { type: 'script', pattern: /mysqli/ }
    ],
    category: 'Database',
    description: 'MySQL database management system',
    confidence: 75
  },
  'HTTP/3': {
    patterns: [
      { type: 'header', pattern: /alt-svc: h3=/i },
      { type: 'header', pattern: /alt-svc: h3-.*=/i }
    ],
    category: 'Protocol',
    description: 'HTTP/3 protocol support',
    confidence: 85
  },
  'Preact': {
    patterns: [
      { type: 'script', pattern: /preact/ },
      { type: 'script', pattern: /preact\.js/ }
    ],
    category: 'JavaScript Framework',
    description: 'Preact lightweight React alternative',
    confidence: 90
  },
  'Flickity': {
    patterns: [
      { type: 'script', pattern: /flickity/ },
      { type: 'script', pattern: /flickity\.js/ }
    ],
    category: 'JavaScript Library',
    description: 'Flickity touch slider library',
    confidence: 90
  },
  'core-js': {
    patterns: [
      { type: 'script', pattern: /core-js/ },
      { type: 'script', pattern: /core\.js/ }
    ],
    category: 'JavaScript Library',
    description: 'core-js JavaScript polyfill library',
    confidence: 85
  },
  'DoubleClick Floodlight': {
    patterns: [
      { type: 'script', pattern: /doubleclick\.net/ },
      { type: 'script', pattern: /floodlight/ },
      { type: 'script', pattern: /googlesyndication\.com/ }
    ],
    category: 'Advertising',
    description: 'Google DoubleClick Floodlight advertising platform',
    confidence: 90
  },
  'WhatsApp Business Chat': {
    patterns: [
      { type: 'script', pattern: /whatsapp\.com/ },
      { type: 'script', pattern: /wa\.me/ },
      { type: 'script', pattern: /whatsapp.*chat/ }
    ],
    category: 'Live Chat',
    description: 'WhatsApp Business live chat widget',
    confidence: 85
  },
  'Microsoft Clarity': {
    patterns: [
      { type: 'script', pattern: /clarity\.ms/ },
      { type: 'script', pattern: /microsoft.*clarity/ }
    ],
    category: 'Analytics',
    description: 'Microsoft Clarity user behavior analytics',
    confidence: 90
  },
  'Zoorix': {
    patterns: [
      { type: 'script', pattern: /zoorix/ },
      { type: 'script', pattern: /zoorix\.com/ }
    ],
    category: 'E-commerce',
    description: 'Zoorix e-commerce platform',
    confidence: 85
  },
  'Show Recent Orders': {
    patterns: [
      { type: 'script', pattern: /show.*recent.*orders/ },
      { type: 'script', pattern: /recent.*orders/ }
    ],
    category: 'E-commerce',
    description: 'Show Recent Orders e-commerce feature',
    confidence: 80
  },
  'Trident AB': {
    patterns: [
      { type: 'script', pattern: /trident.*ab/ },
      { type: 'script', pattern: /tridentab/ }
    ],
    category: 'A/B Testing',
    description: 'Trident AB testing platform',
    confidence: 85
  },
  'Judge.me': {
    patterns: [
      { type: 'script', pattern: /judge\.me/ },
      { type: 'script', pattern: /judgeme/ }
    ],
    category: 'Reviews',
    description: 'Judge.me product review platform',
    confidence: 90
  },
  'Priority Hints': {
    patterns: [
      { type: 'script', pattern: /importance=/ },
      { type: 'script', pattern: /fetchpriority=/ }
    ],
    category: 'Performance',
    description: 'Priority Hints performance optimization',
    confidence: 85
  },
  'Imgix': {
    patterns: [
      { type: 'script', pattern: /imgix\.net/ },
      { type: 'script', pattern: /imgix/ }
    ],
    category: 'CDN',
    description: 'Imgix image optimization CDN',
    confidence: 90
  },
  'GoKwik': {
    patterns: [
      { type: 'script', pattern: /gokwik/ },
      { type: 'script', pattern: /gokwik\.co/ }
    ],
    category: 'E-commerce',
    description: 'GoKwik checkout optimization platform',
    confidence: 85
  },
  'Open Graph': {
    patterns: [
      { type: 'meta', pattern: /property="og:/ },
      { type: 'meta', pattern: /og:/ }
    ],
    category: 'SEO',
    description: 'Open Graph social media protocol',
    confidence: 90
  }
}

async function detectTools(url: string) {
  try {
    console.log('Starting tool detection for:', url)
    
    // Try multiple CORS proxies for better reliability
    const proxies = [
      `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`,
      `https://cors-anywhere.herokuapp.com/${url}`,
      `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`
    ]
    
    let htmlContent = ''
    let lastError = null
    
    for (const proxyUrl of proxies) {
      try {
        console.log('Trying proxy:', proxyUrl)
        const response = await fetch(proxyUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
          }
        })
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }

        const data = await response.json()
        htmlContent = data.contents || data
        
        if (htmlContent && htmlContent.length > 100) {
          console.log('Successfully fetched content, length:', htmlContent.length)
          break
        }
      } catch (error) {
        console.log('Proxy failed:', error)
        lastError = error
        continue
      }
    }

    if (!htmlContent || htmlContent.length < 100) {
      throw new Error(`Failed to fetch content from all proxies. Last error: ${lastError}`)
    }

    const detectedTools = []

    // Extract different types of content for analysis
    const scripts = htmlContent.match(/<script[^>]*>[\s\S]*?<\/script>/gi) || []
    const metaTags = htmlContent.match(/<meta[^>]*>/gi) || []
    const linkTags = htmlContent.match(/<link[^>]*>/gi) || []
    const allContent = htmlContent

    console.log('Content analysis:', {
      scripts: scripts.length,
      metaTags: metaTags.length,
      linkTags: linkTags.length,
      totalLength: allContent.length
    })

    // Analyze each tool pattern
    for (const [toolName, toolData] of Object.entries(toolPatterns)) {
      const evidence: string[] = []
      let matchCount = 0
      const detectionMethods: string[] = []

      // Check each pattern for this tool
      for (const patternInfo of toolData.patterns) {
        let contentToSearch = ''
        
        switch (patternInfo.type) {
          case 'script':
            contentToSearch = scripts.join(' ')
            break
          case 'meta':
            contentToSearch = metaTags.join(' ')
            break
          case 'link':
            contentToSearch = linkTags.join(' ')
            break
          case 'cookie':
            contentToSearch = allContent
            break
          case 'header':
            contentToSearch = allContent
            break
          default:
            contentToSearch = allContent
        }

        const matches = contentToSearch.match(patternInfo.pattern)
        if (matches) {
          matchCount += matches.length
          evidence.push(...matches.slice(0, 2)) // Keep first 2 matches as evidence
          
          // Add detection method if not already added
          const methodName = `${patternInfo.type.charAt(0).toUpperCase() + patternInfo.type.slice(1)} Analysis`
          if (!detectionMethods.includes(methodName)) {
            detectionMethods.push(methodName)
          }
        }
      }

      // If we found matches, add this tool
      if (matchCount > 0) {
        // Use the predefined confidence or calculate based on matches
        const confidence = toolData.confidence || Math.min(95, 60 + (matchCount * 5))
        
        // Only add if confidence is above threshold
        if (confidence >= 70) {
          detectedTools.push({
            id: toolName.toLowerCase().replace(/[^a-z0-9]/g, '_'),
            name: toolName,
            category: toolData.category,
            description: toolData.description,
            confidence,
            detection_methods: detectionMethods.length > 0 ? detectionMethods : ['Content Analysis'],
            evidence: evidence.slice(0, 3) // Limit evidence to 3 items
          })
        }
      }
    }

    // Sort by confidence (highest first)
    detectedTools.sort((a, b) => b.confidence - a.confidence)

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
    console.log('Resources Checker API called')
    const { url } = await request.json()
    console.log('URL received:', url)
    
    if (!url) {
      console.log('No URL provided')
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      )
    }

    // Validate URL format
    try {
      new URL(url)
    } catch {
      console.log('Invalid URL format:', url)
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      )
    }

    console.log('Starting tool detection...')
    // Use client-side tool detection
    const result = await detectTools(url)
    console.log('Tool detection result:', result)
    
    if (result.status === 'error') {
      console.log('Tool detection failed:', result.error)
      return NextResponse.json(
        { error: result.error || 'Failed to analyze website' },
        { status: 500 }
      )
    }

    console.log('Returning successful result with', result.tools_detected, 'tools')
    return NextResponse.json(result)
    
  } catch (error) {
    console.error('Error in resources checker:', error)
    return NextResponse.json(
      { error: `Internal server error: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    )
  }
}
