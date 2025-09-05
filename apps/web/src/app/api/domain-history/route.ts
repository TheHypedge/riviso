import { NextRequest, NextResponse } from 'next/server'

interface DomainInfo {
  domain: string
  status: string
  registered: boolean
  registrationDate?: string
  expirationDate?: string
  lastUpdated?: string
  registrar?: {
    name: string
    url?: string
    whoisServer?: string
  }
  registrant?: {
    name: string
    organization?: string
    email?: string
    phone?: string
    address?: string
    city?: string
    state?: string
    country?: string
    zipCode?: string
  }
  adminContact?: {
    name: string
    email?: string
    phone?: string
  }
  techContact?: {
    name: string
    email?: string
    phone?: string
  }
  nameServers?: string[]
  dnsRecords?: {
    A?: string[]
    AAAA?: string[]
    MX?: Array<{ priority: number; exchange: string }>
    TXT?: string[]
    CNAME?: Array<{ name: string; value: string }>
    NS?: string[]
  }
  rawWhois?: string
  error?: string
}

export async function POST(request: NextRequest) {
  try {
    const { domain } = await request.json()
    
    if (!domain) {
      return NextResponse.json(
        { error: 'Domain is required' },
        { status: 400 }
      )
    }

    // Clean domain input
    const cleanDomain = domain.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0]
    
    console.log(`Fetching domain history for: ${cleanDomain}`)
    
    // Fetch domain information from multiple sources
    const domainInfo = await fetchDomainInfo(cleanDomain)
    
    return NextResponse.json(domainInfo)
    
  } catch (error) {
    console.error('Domain history API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch domain information' },
      { status: 500 }
    )
  }
}

async function fetchDomainInfo(domain: string): Promise<DomainInfo> {
  try {
    // Use multiple WHOIS APIs for better coverage
    const whoisData = await fetchWhoisData(domain)
    const dnsData = await fetchDnsData(domain)
    
    return {
      domain,
      ...whoisData,
      dnsRecords: dnsData,
      registered: whoisData.registered || false
    }
    
  } catch (error) {
    console.error('Error fetching domain info:', error)
    return {
      domain,
      status: 'error',
      registered: false,
      error: 'Failed to fetch domain information'
    }
  }
}

async function fetchWhoisData(domain: string) {
  try {
    // Try multiple WHOIS APIs
    const apis = [
      `https://api.whoisjson.com/v1/whois/${domain}`,
      `https://whoisjson.com/api/v1/whois/${domain}`,
      `https://api.whoisjson.com/whois/${domain}`
    ]
    
    for (const apiUrl of apis) {
      try {
        const response = await fetch(apiUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; SEO-Audit/1.0)'
          }
        })
        
        if (response.ok) {
          const data = await response.json()
          return parseWhoisData(data)
        }
      } catch (e) {
        console.log(`WHOIS API failed: ${apiUrl}`)
        continue
      }
    }
    
    // Fallback to manual WHOIS parsing
    return await fetchManualWhois(domain)
    
  } catch (error) {
    console.error('WHOIS fetch error:', error)
    return {
      status: 'error',
      registered: false,
      error: 'Failed to fetch WHOIS data'
    }
  }
}

async function fetchManualWhois(domain: string) {
  try {
    // Use a CORS proxy to fetch WHOIS data
    const proxyUrl = 'https://api.allorigins.win/raw?url='
    const whoisUrl = `https://whoisjson.com/api/v1/whois/${domain}`
    
    const response = await fetch(proxyUrl + encodeURIComponent(whoisUrl), {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; SEO-Audit/1.0)'
      }
    })
    
    if (response.ok) {
      const data = await response.json()
      return parseWhoisData(data)
    }
    
    return {
      status: 'error',
      registered: false,
      error: 'WHOIS data not available'
    }
    
  } catch (error) {
    console.error('Manual WHOIS fetch error:', error)
    return {
      status: 'error',
      registered: false,
      error: 'Failed to fetch WHOIS data'
    }
  }
}

function parseWhoisData(data: any) {
  try {
    const result: any = {
      status: 'active',
      registered: true
    }
    
    // Parse registration date
    if (data.creation_date) {
      result.registrationDate = formatDate(data.creation_date)
    }
    
    // Parse expiration date
    if (data.expiration_date) {
      result.expirationDate = formatDate(data.expiration_date)
    }
    
    // Parse last updated
    if (data.updated_date) {
      result.lastUpdated = formatDate(data.updated_date)
    }
    
    // Parse registrar
    if (data.registrar) {
      result.registrar = {
        name: data.registrar.name || data.registrar,
        url: data.registrar.url,
        whoisServer: data.registrar.whois_server
      }
    }
    
    // Parse registrant
    if (data.registrant) {
      result.registrant = {
        name: data.registrant.name,
        organization: data.registrant.organization,
        email: data.registrant.email,
        phone: data.registrant.phone,
        address: data.registrant.address,
        city: data.registrant.city,
        state: data.registrant.state,
        country: data.registrant.country,
        zipCode: data.registrant.zip_code
      }
    }
    
    // Parse admin contact
    if (data.admin_contact) {
      result.adminContact = {
        name: data.admin_contact.name,
        email: data.admin_contact.email,
        phone: data.admin_contact.phone
      }
    }
    
    // Parse tech contact
    if (data.tech_contact) {
      result.techContact = {
        name: data.tech_contact.name,
        email: data.tech_contact.email,
        phone: data.tech_contact.phone
      }
    }
    
    // Parse name servers
    if (data.name_servers) {
      result.nameServers = Array.isArray(data.name_servers) 
        ? data.name_servers 
        : [data.name_servers]
    }
    
    // Parse status
    if (data.status) {
      result.status = Array.isArray(data.status) 
        ? data.status.join(', ') 
        : data.status
    }
    
    // Store raw WHOIS data
    if (data.raw_whois) {
      result.rawWhois = data.raw_whois
    }
    
    return result
    
  } catch (error) {
    console.error('Error parsing WHOIS data:', error)
    return {
      status: 'error',
      registered: false,
      error: 'Failed to parse WHOIS data'
    }
  }
}

async function fetchDnsData(domain: string) {
  try {
    // Use multiple DNS APIs
    const dnsApis = [
      `https://dns.google/resolve?name=${domain}&type=A`,
      `https://dns.google/resolve?name=${domain}&type=AAAA`,
      `https://dns.google/resolve?name=${domain}&type=MX`,
      `https://dns.google/resolve?name=${domain}&type=TXT`,
      `https://dns.google/resolve?name=${domain}&type=NS`
    ]
    
    const dnsRecords: any = {}
    
    for (const apiUrl of dnsApis) {
      try {
        const response = await fetch(apiUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; SEO-Audit/1.0)'
          }
        })
        
        if (response.ok) {
          const data = await response.json()
          const recordType = apiUrl.split('type=')[1]
          
          if (data.Answer && data.Answer.length > 0) {
            switch (recordType) {
              case 'A':
                dnsRecords.A = data.Answer.map((record: any) => record.data)
                break
              case 'AAAA':
                dnsRecords.AAAA = data.Answer.map((record: any) => record.data)
                break
              case 'MX':
                dnsRecords.MX = data.Answer.map((record: any) => ({
                  priority: record.data.split(' ')[0],
                  exchange: record.data.split(' ')[1]
                }))
                break
              case 'TXT':
                dnsRecords.TXT = data.Answer.map((record: any) => record.data)
                break
              case 'NS':
                dnsRecords.NS = data.Answer.map((record: any) => record.data)
                break
            }
          }
        }
      } catch (e) {
        const recordType = apiUrl.split('type=')[1]
        console.log(`DNS API failed for ${recordType}: ${apiUrl}`)
        continue
      }
    }
    
    return dnsRecords
    
  } catch (error) {
    console.error('DNS fetch error:', error)
    return {}
  }
}

function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  } catch (error) {
    return dateString
  }
}
