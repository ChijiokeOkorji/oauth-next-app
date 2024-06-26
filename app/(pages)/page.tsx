import clsx from 'clsx';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import SignUpForm from '@/app/_components/auth/sign-up-form';
import styles from '@/app/_styles/modules/page.module.scss';

export default async function Home() {
  const session = await getServerSession();
  
  if (session) {
    return redirect('/dashboard');
  } else {
    return (
      <main className={clsx(
        styles.main,
        styles.center
      )}>
        <SignUpForm />
      </main>
    );
  }
}
