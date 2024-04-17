'use client'

import axios from 'axios';
import { signOut } from 'next-auth/react';

export default async function federatedLogout() {
  try {
    const { data } = await axios('/api/auth/federated-logout');

    await signOut({ redirect: false });
    return window.location.href = data.url;
  } catch (error) {
    console.error(error);
    await signOut({ redirect: false });
    return window.location.href = '/';
  }
}
