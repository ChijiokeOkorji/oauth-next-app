import type { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import Login from "@/app/_components/auth/login";

export const metadata: Metadata = {
  title: 'Sign In'
};

interface SignInPageProp {
  params: object
  searchParams: {
    callbackUrl: string
    error: string
  }
}

export default async function Signin({ searchParams: { callbackUrl } }: SignInPageProp) {
  const session = await getServerSession(authOptions);

  if (session) {
    return redirect(callbackUrl || '/');
  } else {
    return (
      <Login />
    );
  }
}