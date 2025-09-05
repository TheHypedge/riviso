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
    name?: string
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
    name?: string
    email?: string
    phone?: string
  }
  techContact?: {
    name?: string
    email?: string
    phone?: string
  }
  nameServers?: string[]
  dnsRecords?: {
    A?: string[]
    AAAA?: string[]
    MX?: Array<{ priority: number; exchange: string }>
    TXT?: string[]
    NS?: string[]
    CNAME?: string[]
  }
  error?: string
}

export async function POST(request: NextRequest) {
  try {
    const { domain } = await request.json()
    
    if (!domain) {
      return NextResponse.json({ error: 'Domain is required' }, { status: 400 })
    }

    // Clean domain name
    const cleanDomain = domain.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0]
    
    console.log(`Fetching domain history for: ${cleanDomain}`)
    
    // Fetch domain data using RDAP (primary) and WHOIS (fallback)
    const domainInfo = await fetchDomainData(cleanDomain)
    
    return NextResponse.json(domainInfo)
    
  } catch (error) {
    console.error('Domain history API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

async function fetchDomainData(domain: string): Promise<DomainInfo> {
  try {
    // First try RDAP (Registration Data Access Protocol) - the official, free, accurate method
    const rdapResult = await fetchRdapData(domain)
    if (rdapResult.registered !== undefined) {
      // Fetch DNS records to complement RDAP data
      const dnsRecords = await fetchDnsData(domain)
      return { 
        domain,
        status: rdapResult.status || 'active',
        registered: rdapResult.registered,
        registrationDate: rdapResult.registrationDate,
        expirationDate: rdapResult.expirationDate,
        lastUpdated: rdapResult.lastUpdated,
        registrar: rdapResult.registrar,
        registrant: rdapResult.registrant,
        adminContact: rdapResult.adminContact,
        techContact: rdapResult.techContact,
        nameServers: rdapResult.nameServers,
        dnsRecords,
        error: rdapResult.error
      }
    }
    
    // Fallback to WHOIS if RDAP fails
    const whoisResult = await fetchWhoisFallback(domain)
    const dnsRecords = await fetchDnsData(domain)
    return { 
      domain,
      status: whoisResult.status || 'active',
      registered: whoisResult.registered || false,
      registrationDate: whoisResult.registrationDate,
      expirationDate: whoisResult.expirationDate,
      lastUpdated: whoisResult.lastUpdated,
      registrar: whoisResult.registrar,
      registrant: whoisResult.registrant,
      adminContact: whoisResult.adminContact,
      techContact: whoisResult.techContact,
      nameServers: whoisResult.nameServers,
      dnsRecords,
      error: whoisResult.error
    }
    
  } catch (error) {
    console.error('Domain data fetch error:', error)
    return {
      domain,
      status: 'unavailable',
      registered: false,
      error: 'Domain data not available'
    }
  }
}

async function fetchRdapData(domain: string): Promise<Partial<DomainInfo>> {
  try {
    const tld = domain.split('.').pop()?.toLowerCase()
    if (!tld) {
      throw new Error('Invalid domain format')
    }

    // RDAP servers for different TLDs
    const rdapServers = {
      'com': 'https://rdap.verisign.com/com/v1/domain/',
      'net': 'https://rdap.verisign.com/net/v1/domain/',
      'org': 'https://rdap.publicinterestregistry.net/rdap/domain/',
      'info': 'https://rdap.afilias.net/rdap/domain/',
      'biz': 'https://rdap.afilias.net/rdap/domain/',
      'co': 'https://rdap.afilias.net/rdap/domain/',
      'uk': 'https://rdap.nominet.uk/rdap/domain/',
      'de': 'https://rdap.denic.de/rdap/domain/',
      'fr': 'https://rdap.afnic.fr/rdap/domain/',
      'it': 'https://rdap.nic.it/rdap/domain/',
      'es': 'https://rdap.nic.es/rdap/domain/',
      'nl': 'https://rdap.sidn.nl/rdap/domain/',
      'be': 'https://rdap.dns.be/rdap/domain/',
      'ch': 'https://rdap.nic.ch/rdap/domain/',
      'at': 'https://rdap.nic.at/rdap/domain/',
      'se': 'https://rdap.iis.se/rdap/domain/',
      'no': 'https://rdap.norid.no/rdap/domain/',
      'dk': 'https://rdap.dk-hostmaster.dk/rdap/domain/',
      'fi': 'https://rdap.traficom.fi/rdap/domain/',
      'pl': 'https://rdap.dns.pl/rdap/domain/',
      'cz': 'https://rdap.nic.cz/rdap/domain/',
      'sk': 'https://rdap.sk-nic.sk/rdap/domain/',
      'hu': 'https://rdap.nic.hu/rdap/domain/',
      'ro': 'https://rdap.rotld.ro/rdap/domain/',
      'bg': 'https://rdap.register.bg/rdap/domain/',
      'hr': 'https://rdap.dns.hr/rdap/domain/',
      'si': 'https://rdap.arnes.si/rdap/domain/',
      'lt': 'https://rdap.domreg.lt/rdap/domain/',
      'lv': 'https://rdap.nic.lv/rdap/domain/',
      'ee': 'https://rdap.internet.ee/rdap/domain/',
      'ie': 'https://rdap.weare.ie/rdap/domain/',
      'pt': 'https://rdap.dns.pt/rdap/domain/',
      'gr': 'https://rdap.forth.gr/rdap/domain/',
      'cy': 'https://rdap.nic.cy/rdap/domain/',
      'mt': 'https://rdap.nic.org.mt/rdap/domain/',
      'lu': 'https://rdap.dns.lu/rdap/domain/',
      'li': 'https://rdap.nic.li/rdap/domain/',
      'is': 'https://rdap.isnic.is/rdap/domain/',
      'fo': 'https://rdap.arnet.fo/rdap/domain/',
      'gl': 'https://rdap.nic.gl/rdap/domain/',
      'ax': 'https://rdap.aland.fi/rdap/domain/',
      'jp': 'https://rdap.nic.ad.jp/rdap/domain/',
      'kr': 'https://rdap.nic.or.kr/rdap/domain/',
      'cn': 'https://rdap.conac.cn/rdap/domain/',
      'tw': 'https://rdap.twnic.net.tw/rdap/domain/',
      'hk': 'https://rdap.hkirc.hk/rdap/domain/',
      'sg': 'https://rdap.sgnic.sg/rdap/domain/',
      'my': 'https://rdap.mynic.my/rdap/domain/',
      'th': 'https://rdap.thnic.co.th/rdap/domain/',
      'ph': 'https://rdap.dot.ph/rdap/domain/',
      'id': 'https://rdap.pandi.id/rdap/domain/',
      'vn': 'https://rdap.vnnic.vn/rdap/domain/',
      'au': 'https://rdap.auda.org.au/rdap/domain/',
      'nz': 'https://rdap.dnc.org.nz/rdap/domain/',
      'ca': 'https://rdap.cira.ca/rdap/domain/',
      'mx': 'https://rdap.nic.mx/rdap/domain/',
      'br': 'https://rdap.registro.br/rdap/domain/',
      'ar': 'https://rdap.nic.ar/rdap/domain/',
      'cl': 'https://rdap.nic.cl/rdap/domain/',
      'pe': 'https://rdap.nic.pe/rdap/domain/',
      've': 'https://rdap.nic.ve/rdap/domain/',
      'uy': 'https://rdap.nic.uy/rdap/domain/',
      'py': 'https://rdap.nic.py/rdap/domain/',
      'bo': 'https://rdap.nic.bo/rdap/domain/',
      'ec': 'https://rdap.nic.ec/rdap/domain/',
      'za': 'https://rdap.registry.net.za/rdap/domain/',
      'ng': 'https://rdap.nic.net.ng/rdap/domain/',
      'ke': 'https://rdap.kenic.or.ke/rdap/domain/',
      'gh': 'https://rdap.nic.gh/rdap/domain/',
      'ma': 'https://rdap.anrt.ma/rdap/domain/',
      'tn': 'https://rdap.ati.tn/rdap/domain/',
      'dz': 'https://rdap.nic.dz/rdap/domain/',
      'eg': 'https://rdap.eg/rdap/domain/',
      'ly': 'https://rdap.nic.ly/rdap/domain/',
      'io': 'https://rdap.nic.io/rdap/domain/',
      'ac': 'https://rdap.nic.ac/rdap/domain/',
      'sh': 'https://rdap.nic.sh/rdap/domain/',
      'cx': 'https://rdap.nic.cx/rdap/domain/',
      'cc': 'https://rdap.nic.cc/rdap/domain/',
      'tv': 'https://rdap.nic.tv/rdap/domain/',
      'fm': 'https://rdap.nic.fm/rdap/domain/',
      'ws': 'https://rdap.nic.ws/rdap/domain/',
      'to': 'https://rdap.nic.to/rdap/domain/',
      'vu': 'https://rdap.nic.vu/rdap/domain/',
      'fj': 'https://rdap.nic.fj/rdap/domain/',
      'pg': 'https://rdap.nic.pg/rdap/domain/',
      'sb': 'https://rdap.nic.sb/rdap/domain/',
      'nc': 'https://rdap.nic.nc/rdap/domain/',
      'pf': 'https://rdap.nic.pf/rdap/domain/',
      'wf': 'https://rdap.nic.wf/rdap/domain/',
      'as': 'https://rdap.nic.as/rdap/domain/',
      'gu': 'https://rdap.nic.gu/rdap/domain/',
      'mp': 'https://rdap.nic.mp/rdap/domain/',
      'vi': 'https://rdap.nic.vi/rdap/domain/',
      'pr': 'https://rdap.nic.pr/rdap/domain/',
      'do': 'https://rdap.nic.do/rdap/domain/',
      'ht': 'https://rdap.nic.ht/rdap/domain/',
      'cu': 'https://rdap.nic.cu/rdap/domain/',
      'jm': 'https://rdap.nic.jm/rdap/domain/',
      'tt': 'https://rdap.nic.tt/rdap/domain/',
      'bb': 'https://rdap.nic.bb/rdap/domain/',
      'ag': 'https://rdap.nic.ag/rdap/domain/',
      'dm': 'https://rdap.nic.dm/rdap/domain/',
      'gd': 'https://rdap.nic.gd/rdap/domain/',
      'kn': 'https://rdap.nic.kn/rdap/domain/',
      'lc': 'https://rdap.nic.lc/rdap/domain/',
      'vc': 'https://rdap.nic.vc/rdap/domain/',
      'ai': 'https://rdap.nic.ai/rdap/domain/',
      'vg': 'https://rdap.nic.vg/rdap/domain/',
      'ky': 'https://rdap.nic.ky/rdap/domain/',
      'tc': 'https://rdap.nic.tc/rdap/domain/',
      'bs': 'https://rdap.nic.bs/rdap/domain/',
      'bz': 'https://rdap.nic.bz/rdap/domain/',
      'gt': 'https://rdap.nic.gt/rdap/domain/',
      'sv': 'https://rdap.nic.sv/rdap/domain/',
      'hn': 'https://rdap.nic.hn/rdap/domain/',
      'ni': 'https://rdap.nic.ni/rdap/domain/',
      'cr': 'https://rdap.nic.cr/rdap/domain/',
      'pa': 'https://rdap.nic.pa/rdap/domain/'
    }

    const rdapUrl = rdapServers[tld as keyof typeof rdapServers]
    if (!rdapUrl) {
      console.log(`No RDAP server found for TLD: ${tld}`)
      return { registered: undefined }
    }

    const fullUrl = `${rdapUrl}${domain}`
    console.log(`Fetching RDAP data from: ${fullUrl}`)

    const response = await fetch(fullUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; SEO-Audit/1.0)',
        'Accept': 'application/rdap+json, application/json'
      }
    })

    if (response.ok) {
      const data = await response.json()
      console.log(`RDAP response for ${domain}:`, JSON.stringify(data, null, 2))
      return parseRdapData(data, domain)
    } else if (response.status === 404) {
      console.log(`Domain ${domain} not found via RDAP`)
      return { registered: false, status: 'available' }
    } else {
      console.log(`RDAP failed for ${domain}: ${response.status} ${response.statusText}`)
      return { registered: undefined }
    }

  } catch (error) {
    console.error(`RDAP fetch error for ${domain}:`, error)
    return { registered: undefined }
  }
}

function parseRdapData(data: any, domain: string): Partial<DomainInfo> {
  try {
    const result: Partial<DomainInfo> = {
      domain: domain,
      status: 'active',
      registered: true
    }

    // Parse events (registration, expiration, last updated)
    if (data.events && Array.isArray(data.events)) {
      for (const event of data.events) {
        if (event.eventAction === 'registration') {
          result.registrationDate = formatDate(event.eventDate)
        } else if (event.eventAction === 'expiration') {
          result.expirationDate = formatDate(event.eventDate)
        } else if (event.eventAction === 'last changed' || event.eventAction === 'last update') {
          result.lastUpdated = formatDate(event.eventDate)
        }
      }
    }

    // Parse registrar from entities array
    if (data.entities && Array.isArray(data.entities)) {
      const registrarEntity = data.entities.find((entity: any) => 
        entity.roles && entity.roles.includes('registrar')
      )
      
      if (registrarEntity) {
        result.registrar = {
          name: registrarEntity.vcardArray?.[1]?.find((vcard: any) => vcard[0] === 'fn')?.[3] || 'Unknown',
          url: registrarEntity.links?.[0]?.href || '',
          whoisServer: registrarEntity.publicIds?.find((id: any) => id.type === 'IANA Registrar ID')?.identifier || ''
        }
      }
    }

    // Parse registrant, admin, and tech contacts from entities array
    if (data.entities && Array.isArray(data.entities)) {
      // Find registrant entity
      const registrantEntity = data.entities.find((entity: any) => 
        entity.roles && entity.roles.includes('registrant')
      )
      
      if (registrantEntity && registrantEntity.vcardArray) {
        const vcard = registrantEntity.vcardArray[1]
        result.registrant = {
          name: vcard.find((item: any) => item[0] === 'fn')?.[3] || '',
          organization: vcard.find((item: any) => item[0] === 'org')?.[3] || '',
          email: vcard.find((item: any) => item[0] === 'email')?.[3] || '',
          phone: vcard.find((item: any) => item[0] === 'tel')?.[3] || '',
          address: vcard.find((item: any) => item[0] === 'adr')?.[3] || '',
          city: vcard.find((item: any) => item[0] === 'locality')?.[3] || '',
          state: vcard.find((item: any) => item[0] === 'region')?.[3] || '',
          country: vcard.find((item: any) => item[0] === 'country-name')?.[3] || '',
          zipCode: vcard.find((item: any) => item[0] === 'postal-code')?.[3] || ''
        }
      }

      // Find admin contact entity
      const adminEntity = data.entities.find((entity: any) => 
        entity.roles && entity.roles.includes('administrative')
      )
      
      if (adminEntity && adminEntity.vcardArray) {
        const vcard = adminEntity.vcardArray[1]
        result.adminContact = {
          name: vcard.find((item: any) => item[0] === 'fn')?.[3] || '',
          email: vcard.find((item: any) => item[0] === 'email')?.[3] || '',
          phone: vcard.find((item: any) => item[0] === 'tel')?.[3] || ''
        }
      }

      // Find tech contact entity
      const techEntity = data.entities.find((entity: any) => 
        entity.roles && entity.roles.includes('technical')
      )
      
      if (techEntity && techEntity.vcardArray) {
        const vcard = techEntity.vcardArray[1]
        result.techContact = {
          name: vcard.find((item: any) => item[0] === 'fn')?.[3] || '',
          email: vcard.find((item: any) => item[0] === 'email')?.[3] || '',
          phone: vcard.find((item: any) => item[0] === 'tel')?.[3] || ''
        }
      }
    }

    // Parse name servers
    if (data.nameservers && Array.isArray(data.nameservers)) {
      result.nameServers = data.nameservers.map((ns: any) => ns.ldhName || ns.name)
    }

    // Parse status
    if (data.status && Array.isArray(data.status)) {
      result.status = data.status.join(', ')
    }

    return result

  } catch (error) {
    console.error('RDAP parsing error:', error)
    return { registered: undefined }
  }
}

async function fetchWhoisFallback(domain: string): Promise<Partial<DomainInfo>> {
  try {
    // Simple WHOIS fallback for TLDs without RDAP support
    const whoisApis = [
      `https://api.allorigins.win/raw?url=${encodeURIComponent(`https://whoisjson.com/api/v1/whois/${domain}`)}`,
      `https://whoisjson.com/api/v1/whois/${domain}`
    ]
    
    for (const apiUrl of whoisApis) {
      try {
        const response = await fetch(apiUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; SEO-Audit/1.0)',
            'Accept': 'application/json'
          }
        })
        
        if (response.ok) {
          const data = await response.json()
          console.log(`WHOIS fallback response for ${domain}:`, JSON.stringify(data, null, 2))
          const parsed = parseWhoisData(data)
          if (parsed.registered !== undefined) {
            return parsed
          }
        }
      } catch (e) {
        console.log(`WHOIS fallback failed: ${apiUrl}`)
        continue
      }
    }
    
    // Final fallback to DNS check
    return await checkDomainAvailability(domain)
    
  } catch (error) {
    console.error('WHOIS fallback error:', error)
    return await checkDomainAvailability(domain)
  }
}

function parseWhoisData(data: any): Partial<DomainInfo> {
  try {
    const result: Partial<DomainInfo> = {
      status: 'active',
      registered: true
    }

    // Check if domain is registered
    if (data.error === 'Domain not found' || data.status === 'available') {
      return {
        status: 'available',
        registered: false
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

    return result

  } catch (error) {
    console.error('WHOIS parsing error:', error)
    return { registered: undefined }
  }
}

async function checkDomainAvailability(domain: string): Promise<Partial<DomainInfo>> {
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
        registered: false
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

async function fetchDnsData(domain: string) {
  try {
    const recordTypes = ['A', 'AAAA', 'MX', 'TXT', 'NS', 'CNAME']
    const dnsRecords: any = {}
    
    for (const recordType of recordTypes) {
      try {
        const apiUrl = `https://dns.google/resolve?name=${domain}&type=${recordType}`
        const response = await fetch(apiUrl)
        const data = await response.json()
        
        if (data.Answer && data.Answer.length > 0) {
          if (recordType === 'MX') {
            dnsRecords[recordType] = data.Answer.map((record: any) => ({
              priority: record.data.split(' ')[0],
              exchange: record.data.split(' ')[1]
            }))
          } else {
            dnsRecords[recordType] = data.Answer.map((record: any) => record.data)
          }
        }
      } catch (e) {
        console.log(`DNS API failed for ${recordType}: https://dns.google/resolve?name=${domain}&type=${recordType}`)
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