'use client'

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import styles from '@/app/_styles/modules/user-card.module.scss';
import InputField from '@/app/_components/input-field-component';
import Button from '@/app/_components/button';
import { fetchUserAuthCredentials, generateNewApiKeys } from '@/app/_lib/actions';
import { UserAPICredentialsResponse } from '@/app/_lib/definitions';

interface UserCardProps {
  user:  {
    name?: string | null;
    email?: string | null;
  };
}

export default function UserCard({ user }: UserCardProps) {
  const [authCredentials, setAuthCredentials] = useState<UserAPICredentialsResponse | undefined>();

  useEffect(() => {
    async function fetchAuthCredentials() {
      if (user.email) {
        const credentials = await fetchUserAuthCredentials(user.email);
        setAuthCredentials(credentials);
      }
    }

    fetchAuthCredentials();
  }, [user.email]);

  const handleGenerateNewApiKeys = useCallback(async () => {
    if (user.email) {
      const auth = await generateNewApiKeys(user.email);

      setAuthCredentials((prev) => {
        if (prev && auth.api_key) {
          return ({
            ...prev,
            api_key: auth.api_key
          });
        } else {
          return prev;
        }
      });
    }
  }, [user.email]);

  return (
    <div className={styles['user-card']}>
      <div className={styles.title}>Dashboard</div>
      
      <div className={styles.section}>
        <div className={styles.subtitle}>Profile</div>
        <InputField name="fullname" placeholder="Full Name" readOnlyValue={user.name!} />
        <InputField name="email" placeholder="Email" readOnlyValue={user.email!} />
      </div>

      <div className={styles.section}>
        <div className={styles.subtitle}>Authentication</div>

        <div>
          <InputField name="apiKeys" placeholder="API Key" readOnlyValue={authCredentials?.api_key || ' '} canCopy={true} />
          <Button type='outlined' label="Regenerate API Key" onClick={handleGenerateNewApiKeys} />
        </div>

        <div>
          <InputField name="clientId" placeholder="Client ID" readOnlyValue={authCredentials?.client_id || ' '} canCopy={true} />
          <InputField name="clientSecret" placeholder="Client Secret" readOnlyValue={authCredentials?.client_secret || ' '} canCopy={true} />
          
          <Link href="/dashboard/client-credentials/create">
            <Button type="outlined" label="New Client Credentials" />
          </Link>
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
