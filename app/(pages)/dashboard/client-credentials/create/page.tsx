import clsx from 'clsx';
import type { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import styles from '@/app/_styles/modules/page.module.scss';
import CreateClientCredentials from '@/app/_components/dashboard/create-client-credentials';

export const metadata: Metadata = {
  title: 'Create Client Credentials'
};

export default async function Page() {
  const session = await getServerSession();

  return (
    <main className={clsx(
      styles.main,
      styles.center
    )}>
      <CreateClientCredentials email={session?.user?.email!} />
    </main>
  );
}
