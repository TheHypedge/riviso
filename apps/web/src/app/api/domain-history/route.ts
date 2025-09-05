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
    // First check if domain is accessible via DNS
    const dnsData = await fetchDnsData(domain)
    const hasDnsRecords = dnsData.A?.length > 0 || dnsData.AAAA?.length > 0 || dnsData.MX?.length > 0
    
    // Try to get WHOIS data
    const whoisData = await fetchWhoisData(domain)
    
    // Determine if domain is registered based on WHOIS data or DNS records
    const isRegistered = whoisData.registered || hasDnsRecords
    
    return {
      domain,
      status: isRegistered ? 'active' : 'available',
      registered: isRegistered,
      ...whoisData,
      dnsRecords: dnsData
    }
    
  } catch (error) {
    console.error('Error fetching domain info:', error)
    return {
      domain,
      status: 'unavailable',
      registered: false,
      error: 'Failed to fetch domain information'
    }
  }
}

async function fetchWhoisData(domain: string) {
  try {
    // Use a more reliable approach with multiple APIs
    const apis = [
      `https://api.whoisjson.com/v1/whois/${domain}`,
      `https://whoisjson.com/api/v1/whois/${domain}`,
      `https://api.whoisjson.com/whois/${domain}`,
      `https://whoisjson.com/api/v1/whois/${domain}?format=json`,
      `https://api.whoisjson.com/v1/whois/${domain}?format=json`
    ]
    
    for (const apiUrl of apis) {
      try {
        const response = await fetch(apiUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; SEO-Audit/1.0)',
            'Accept': 'application/json'
          }
        })
        
        if (response.ok) {
          const data = await response.json()
          console.log(`WHOIS API response for ${domain}:`, JSON.stringify(data, null, 2))
          const parsed = parseWhoisData(data)
          if (parsed.registered !== undefined) {
            return parsed
          }
        }
      } catch (e) {
        console.log(`WHOIS API failed: ${apiUrl}`)
        continue
      }
    }
    
    // Fallback to alternative WHOIS service
    return await fetchAlternativeWhois(domain)
    
  } catch (error) {
    console.error('WHOIS fetch error:', error)
    return {
      status: 'unavailable',
      registered: false,
      error: 'WHOIS data not available'
    }
  }
}

async function fetchAlternativeWhois(domain: string) {
  try {
    // Try alternative WHOIS services
    const alternativeApis = [
      `https://whoisjson.com/api/v1/whois/${domain}`,
      `https://api.whoisjson.com/whois/${domain}`,
      `https://whoisjson.com/api/v1/whois/${domain}?format=json`
    ]
    
    for (const apiUrl of alternativeApis) {
      try {
        const response = await fetch(apiUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; SEO-Audit/1.0)',
            'Accept': 'application/json'
          }
        })
        
        if (response.ok) {
          const data = await response.json()
          console.log(`Alternative WHOIS API response for ${domain}:`, JSON.stringify(data, null, 2))
          const parsed = parseWhoisData(data)
          if (parsed.registered !== undefined) {
            return parsed
          }
        }
      } catch (e) {
        console.log(`Alternative WHOIS API failed: ${apiUrl}`)
        continue
      }
    }
    
    // Final fallback to DNS check
    return await checkDomainAvailability(domain)
    
  } catch (error) {
    console.error('Alternative WHOIS fetch error:', error)
    return await checkDomainAvailability(domain)
  }
}

async function checkDomainAvailability(domain: string) {
  try {
    // Use a simple DNS lookup to check if domain exists
    const dnsResponse = await fetch(`https://dns.google/resolve?name=${domain}&type=A`)
    const dnsData = await dnsResponse.json()
    
    if (dnsData.Answer && dnsData.Answer.length > 0) {
      return {
        status: 'active',
        registered: true,
        registrationDate: 'Unknown',
        expirationDate: 'Unknown'
      }
    } else {
      return {
        status: 'available',
        registered: false,
        registrationDate: undefined,
        expirationDate: undefined
      }
    }
  } catch (error) {
    return {
      status: 'unavailable',
      registered: false,
      error: 'Unable to determine domain status'
    }
  }
}

function parseWhoisData(data: any) {
  try {
    const result: any = {
      status: 'active',
      registered: true
    }
    
    // Check if domain is registered based on common indicators
    if (data.error || data.message || data.status === 'error') {
      return {
        status: 'available',
        registered: false,
        registrationDate: undefined,
        expirationDate: undefined
      }
    }
    
    // Parse registration date - try multiple field names
    const regDate = data.creation_date || data.created_date || data.registered || 
                   data.creationDate || data.createdDate || data.registeredDate ||
                   data.creation || data.created || data.registered_at
    if (regDate) {
      result.registrationDate = formatDate(regDate)
    }
    
    // Parse expiration date - try multiple field names
    const expDate = data.expiration_date || data.expires || data.expiry || 
                   data.expirationDate || data.expiresDate || data.expiryDate ||
                   data.expiration || data.expires_at || data.expiry_at
    if (expDate) {
      result.expirationDate = formatDate(expDate)
    }
    
    // Parse last updated - try multiple field names
    const updDate = data.updated_date || data.updated || data.lastUpdated ||
                   data.updatedDate || data.last_updated || data.lastUpdatedDate ||
                   data.modified || data.modified_at
    if (updDate) {
      result.lastUpdated = formatDate(updDate)
    }
    
    // Parse registrar - try multiple field names
    const registrar = data.registrar || data.registrarName || data.registrar_name
    if (registrar) {
      result.registrar = {
        name: registrar.name || registrar.registrar || registrar,
        url: registrar.url || registrar.website || registrar.registrar_url,
        whoisServer: registrar.whois_server || registrar.whoisServer || registrar.whois
      }
    }
    
    // Parse registrant - try multiple field names
    const registrant = data.registrant || data.owner || data.domain_owner || data.owner_info
    if (registrant) {
      result.registrant = {
        name: registrant.name || registrant.registrant_name || registrant.owner_name,
        organization: registrant.organization || registrant.org || registrant.company,
        email: registrant.email || registrant.registrant_email || registrant.owner_email,
        phone: registrant.phone || registrant.registrant_phone || registrant.owner_phone,
        address: registrant.address || registrant.registrant_address || registrant.owner_address,
        city: registrant.city || registrant.registrant_city || registrant.owner_city,
        state: registrant.state || registrant.registrant_state || registrant.owner_state,
        country: registrant.country || registrant.registrant_country || registrant.owner_country,
        zipCode: registrant.zip_code || registrant.zipCode || registrant.postal_code
      }
    }
    
    // Parse admin contact - try multiple field names
    const adminContact = data.admin_contact || data.adminContact || data.admin || data.administrative_contact
    if (adminContact) {
      result.adminContact = {
        name: adminContact.name || adminContact.admin_name || adminContact.contact_name,
        email: adminContact.email || adminContact.admin_email || adminContact.contact_email,
        phone: adminContact.phone || adminContact.admin_phone || adminContact.contact_phone
      }
    }
    
    // Parse tech contact - try multiple field names
    const techContact = data.tech_contact || data.techContact || data.technical_contact || data.tech
    if (techContact) {
      result.techContact = {
        name: techContact.name || techContact.tech_name || techContact.contact_name,
        email: techContact.email || techContact.tech_email || techContact.contact_email,
        phone: techContact.phone || techContact.tech_phone || techContact.contact_phone
      }
    }
    
    // Parse name servers - try multiple field names
    const nameServers = data.name_servers || data.nameservers || data.nameServers || 
                       data.ns || data.name_server || data.dns_servers
    if (nameServers) {
      result.nameServers = Array.isArray(nameServers) 
        ? nameServers 
        : [nameServers]
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
      status: 'unavailable',
      registered: false,
      error: 'Failed to parse WHOIS data'
    }
  }
}

async function fetchDnsData(domain: string) {
  try {
    // Use Google's DNS API for reliable DNS lookups
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
                  priority: parseInt(record.data.split(' ')[0]),
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
  if (!dateString) return 'Unknown'
  
  try {
    // Handle various date formats
    let date: Date
    
    // Try parsing as-is first
    date = new Date(dateString)
    
    // If invalid, try common WHOIS date formats
    if (isNaN(date.getTime())) {
      // Try YYYY-MM-DD format
      if (/^\d{4}-\d{2}-\d{2}/.test(dateString)) {
        date = new Date(dateString)
      }
      // Try DD-MMM-YYYY format
      else if (/^\d{2}-[A-Za-z]{3}-\d{4}/.test(dateString)) {
        date = new Date(dateString)
      }
      // Try YYYY/MM/DD format
      else if (/^\d{4}\/\d{2}\/\d{2}/.test(dateString)) {
        date = new Date(dateString)
      }
      // Try parsing just the date part if there's extra text
      else {
        const dateMatch = dateString.match(/(\d{4}-\d{2}-\d{2})|(\d{2}-[A-Za-z]{3}-\d{4})|(\d{4}\/\d{2}\/\d{2})/)
        if (dateMatch) {
          date = new Date(dateMatch[0])
        }
      }
    }
    
    if (isNaN(date.getTime())) {
      return dateString || 'Unknown'
    }
    
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  } catch (error) {
    return dateString || 'Unknown'
  }
}