import clsx from 'clsx';
import type { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import styles from '@/app/_styles/modules/page.module.scss';
import DashboardCard from '@/app/_components/dashboard/dashboard-card';

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
      <DashboardCard user={session?.user!} />
    </main>
  );
}
