import type { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import Logout from '@/app/_components/auth/logout';

export const metadata: Metadata = {
  title: 'Sign Out'
};

export default async function Page() {
  const session = await getServerSession();
  if (session) {
    return (
      <Logout />
    )
  } else {
    return redirect('/');
  }
}
