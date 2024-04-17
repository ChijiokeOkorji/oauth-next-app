'use client'

import Link from 'next/link';
import styles from '@/app/_styles/modules/user-card.module.scss';
import InputField from '@/app/_components/input-field-component';
import Button from '@/app/_components/button';

interface UserCardProps {
  user:  {
    name?: string | null;
    email?: string | null;
  };
}

export default function UserCard({ user }: UserCardProps) {
  return (
    <div className={styles['user-card']}>
      {<div className={styles.title}>Dashboard</div>}
      
      <div className={styles.section}>
        <div className={styles.subtitle}>Profile</div>
        <InputField name="fullname" placeholder="Full Name" readOnlyValue={user.name!} />
        <InputField name="email" placeholder="Email" readOnlyValue={user.email!} />
      </div>

      <div className={styles.section}>
        <div className={styles.subtitle}>Authentication</div>

        <div>
          <InputField name="apiKeys" placeholder="API Key" readOnlyValue={'djknfkjdnfkjndfjkvnfdjdhnhvbhdjfbvdjhfbvjdfhbvjdhfbvjhdfbvhjdfbvjhdfbvjfhdvbfdhjvbfjhvbdfjhvbdfjhvbdfhjvbkjvn'} canCopy={true} />
          <Button type='outlined' label="Regenerate API Key" />
        </div>

        <div>
          <InputField name="clientId" placeholder="Client ID" readOnlyValue={'cmnfkcjndfkjvndjknvdkjv'} canCopy={true} />
          <InputField name="clientSecret" placeholder="Client Secret" readOnlyValue={'ckjfnkdjnfvkjdnvjkndfvkjdnvkjndfkjvndkjvn'} canCopy={true} />
          <Button type="outlined" label="New Client Credentials" />
        </div>
      </div>

      <div className={styles.section}>
        <Link href="/auth/signout">
          <Button label="Sign Out" />
        </Link>
      </div>
    </div>
  );
}
