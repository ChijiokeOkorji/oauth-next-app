import Link from 'next/link';
import styles from '@/app/_styles/modules/user-card.module.scss';
import Button from '@/app/_components/button';

export default function NewUser() {
  return (
    <div className={styles['user-card']}>
      <div className={styles.title}>Account Created Successfully</div>

      <div className={styles.section}>
        <Link href="/auth/signin">
          <Button label="Sign In" />
        </Link>
      </div>
    </div>
  );
}
