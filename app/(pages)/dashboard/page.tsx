import clsx from 'clsx';
import type { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import styles from '@/app/_styles/modules/page.module.scss';
import UserCard from '@/app/_components/dashboard/user-card';

export const metadata: Metadata = {
  title: 'Dashboard'
};

export default async function Page() {
  const session = await getServerSession();

  return (
    <main className={clsx(
      styles.main,
      styles.center
    )}>
      <UserCard user={session?.user!} />
    </main>
  );
}
