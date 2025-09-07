'use client'

import React, { createContext, useContext, useState, ReactNode } from 'react'

interface GlobalSearchContextType {
  globalUrl: string
  setGlobalUrl: (url: string) => void
  clearGlobalUrl: () => void
  isValidUrl: boolean
  validateUrl: (url: string) => boolean
}

const GlobalSearchContext = createContext<GlobalSearchContextType | undefined>(undefined)

export function GlobalSearchProvider({ children }: { children: ReactNode }) {
  const [globalUrl, setGlobalUrl] = useState('')

  const validateUrl = (url: string): boolean => {
    if (!url.trim()) return false
    
    try {
      // Normalize URL - add https:// if no protocol
      let normalizedUrl = url.trim()
      if (!normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) {
        normalizedUrl = 'https://' + normalizedUrl
      }
      
      const urlObj = new URL(normalizedUrl)
      
      // Check if protocol is valid
      if (!['http:', 'https:'].includes(urlObj.protocol)) {
        return false
      }
      
      // Check if hostname has a valid domain with extension
      const hostname = urlObj.hostname
      
      // Remove 'www.' prefix if present for validation
      const domain = hostname.replace(/^www\./, '')
      
      // Check if domain has at least one dot and ends with a valid extension
      const domainParts = domain.split('.')
      if (domainParts.length < 2) {
        return false
      }
      
      // Check if the last part (extension) is at least 2 characters
      const extension = domainParts[domainParts.length - 1]
      if (extension.length < 2) {
        return false
      }
      
      // Check if extension contains only letters (no numbers or special chars)
      if (!/^[a-zA-Z]+$/.test(extension)) {
        return false
      }
      
      // Check if domain name (before extension) is not empty
      const domainName = domainParts.slice(0, -1).join('.')
      if (!domainName || domainName.length === 0) {
        return false
      }
      
      return true
    } catch {
      return false
    }
  }

  const isValidUrl = validateUrl(globalUrl)

  const clearGlobalUrl = () => {
    setGlobalUrl('')
  }

  const value: GlobalSearchContextType = {
    globalUrl,
    setGlobalUrl,
    clearGlobalUrl,
    isValidUrl,
    validateUrl
  }

  return (
    <GlobalSearchContext.Provider value={value}>
      {children}
    </GlobalSearchContext.Provider>
  )
}

export function useGlobalSearch() {
  const context = useContext(GlobalSearchContext)
  if (context === undefined) {
    throw new Error('useGlobalSearch must be used within a GlobalSearchProvider')
  }
  return context
}
