import clsx from 'clsx';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import SignUpForm from '@/app/_components/auth/sign-up-form';
import styles from '@/app/_styles/modules/page.module.scss';

export default async function Home() {
  const session = await getServerSession(authOptions);
  
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
