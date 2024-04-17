'use client'

import { signIn, useSession } from 'next-auth/react';
import { ReactNode, useEffect } from 'react';

export default function SessionGuard({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === 'authenticated' && 'error' in session && session.error === 'RefreshAccessTokenError') {
      // If the session is authenticated and there's a refresh token error, trigger sign-in again
      signIn('keycloak');
    }
  }, [session, status]);

  return (
    <>
      {children}
    </>
  );
}
