import clsx from 'clsx';
import type { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import styles from '@/app/_styles/modules/page.module.scss';
import NewUser from '@/app/_components/auth/new-user';

export const metadata: Metadata = {
  title: 'New User'
};

export default async function Page() {
  const session = await getServerSession();

  if (session) {
    return redirect('/dashboard');
  } else {
    return (
      <main className={clsx(
        styles.main,
        styles.center
      )}>
        <NewUser />
      </main>
    );
  }
}
