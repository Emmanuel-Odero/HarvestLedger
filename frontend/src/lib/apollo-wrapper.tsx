'use client'

import { ApolloClient, InMemoryCache, ApolloProvider, createHttpLink } from '@apollo/client'
import { setContext } from '@apollo/client/link/context'

// Use proxy in production (Vercel), direct URL in development
const getGraphQLUrl = () => {
  if (typeof window !== 'undefined') {
    // Client-side
    if (process.env.NODE_ENV === 'production' && !process.env.NEXT_PUBLIC_DOCKER_BUILD) {
      return '/api/proxy/graphql'
    }
  }
  return process.env.NEXT_PUBLIC_GRAPHQL_URL || 'http://localhost:8000/graphql'
}

const httpLink = createHttpLink({
  uri: getGraphQLUrl(),
})

const authLink = setContext((_, { headers }) => {
  // Get the authentication token from local storage if it exists
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
  
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
    }
  }
})

const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      errorPolicy: 'all',
    },
    query: {
      errorPolicy: 'all',
    },
  },
})

export function ApolloWrapper({ children }: { children: React.ReactNode }) {
  return <ApolloProvider client={client}>{children}</ApolloProvider>
}