// API utility functions for both development and production

export const getApiUrl = (path: string): string => {
  // Remove leading slash if present
  const cleanPath = path.startsWith('/') ? path.slice(1) : path
  
  if (typeof window !== 'undefined') {
    // Client-side
    if (process.env.NODE_ENV === 'production' && !process.env.NEXT_PUBLIC_DOCKER_BUILD) {
      // Production (Vercel) - use proxy
      return `/api/proxy/${cleanPath}`
    }
  }
  
  // Development or Docker - use direct backend URL
  const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'
  return `${baseUrl}/${cleanPath}`
}

export const apiCall = async (
  path: string,
  options: RequestInit = {}
): Promise<Response> => {
  const url = getApiUrl(path)
  
  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
  }
  
  // Add authorization header if token exists
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token')
    if (token) {
      defaultHeaders.Authorization = `Bearer ${token}`
    }
  }
  
  const config: RequestInit = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  }
  
  return fetch(url, config)
}

// Convenience methods
export const api = {
  get: (path: string, options?: RequestInit) =>
    apiCall(path, { ...options, method: 'GET' }),
  
  post: (path: string, data?: any, options?: RequestInit) =>
    apiCall(path, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    }),
  
  put: (path: string, data?: any, options?: RequestInit) =>
    apiCall(path, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    }),
  
  delete: (path: string, options?: RequestInit) =>
    apiCall(path, { ...options, method: 'DELETE' }),
  
  patch: (path: string, data?: any, options?: RequestInit) =>
    apiCall(path, {
      ...options,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    }),
}