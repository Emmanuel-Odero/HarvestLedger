'use client';

import { ApolloProvider } from '@apollo/client';
import { createDemoApolloClient } from '@/lib/demo-apollo-client';

// Use the demo Apollo client which can switch between demo and live modes
const client = createDemoApolloClient();

export function ApolloProviderWrapper({ children }: { children: React.ReactNode }) {
  return (
    <ApolloProvider client={client}>
      {children}
    </ApolloProvider>
  );
}