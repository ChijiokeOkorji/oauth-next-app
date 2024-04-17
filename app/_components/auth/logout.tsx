'use client'

import { useEffect } from 'react';
import federatedLogout from '@/app/_lib/utils/federated-logout';

export default function Login() {
  useEffect(() => {
    const initiateSignOut = async () => {
      await federatedLogout();
    };

    initiateSignOut();
  }, []);
  
  return null;
}
