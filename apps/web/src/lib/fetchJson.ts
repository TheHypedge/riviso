export interface FetchOptions extends RequestInit {
  timeout?: number
}

export class FetchError extends Error {
  constructor(
    message: string,
    public status: number,
    public statusText: string,
    public response?: Response
  ) {
    super(message)
    this.name = 'FetchError'
  }
}

export async function fetchJson<T>(
  url: string,
  options: FetchOptions = {}
): Promise<T> {
  const { timeout = 10000, ...fetchOptions } = options

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout)

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...fetchOptions.headers,
      },
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`
      
      try {
        const errorData = await response.json()
        errorMessage = errorData.detail || errorData.message || errorMessage
      } catch {
        // If we can't parse the error response, use the default message
      }

      throw new FetchError(errorMessage, response.status, response.statusText, response)
    }

    const contentType = response.headers.get('content-type')
    if (contentType && contentType.includes('application/json')) {
      return await response.json()
    }

    return response as unknown as T
  } catch (error) {
    clearTimeout(timeoutId)
    
    if (error instanceof FetchError) {
      throw error
    }
    
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new FetchError('Request timeout', 408, 'Request Timeout')
      }
      throw new FetchError(error.message, 0, 'Network Error')
    }
    
    throw new FetchError('Unknown error occurred', 0, 'Unknown Error')
  }
}

export async function fetchWithRetry<T>(
  url: string,
  options: FetchOptions = {},
  maxRetries: number = 3
): Promise<T> {
  let lastError: Error

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fetchJson<T>(url, options)
    } catch (error) {
      lastError = error as Error
      
      // Don't retry on client errors (4xx) except 408 (timeout)
      if (error instanceof FetchError && error.status >= 400 && error.status < 500 && error.status !== 408) {
        throw error
      }
      
      // Don't retry on the last attempt
      if (attempt === maxRetries) {
        throw error
      }
      
      // Exponential backoff
      const delay = Math.pow(2, attempt) * 1000
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }

  throw lastError!
}
