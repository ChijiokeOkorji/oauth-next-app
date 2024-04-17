'use client'

import { useEffect } from 'react';
import { signIn } from 'next-auth/react';

export default function Login() {
  useEffect(() => {
    const initiateSignIn = async () => {
      await signIn('keycloak');
    };

    initiateSignIn();
  }, []);
  
  return null;
}
