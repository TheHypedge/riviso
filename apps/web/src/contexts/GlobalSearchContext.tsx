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
      return ['http:', 'https:'].includes(urlObj.protocol)
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
