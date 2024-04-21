'use client'

import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react';
import { useFormState } from 'react-dom';
import { createClientCredentials, fetchCurrentClientCredentialDetails } from '@/app/_lib/actions';
import Form from '@/app/_components/form';
import InputField from '@/app/_components/input-field-component';
import FormError from '@/app/_components/form-error';
import Button from '@/app/_components/button';
import { CurrentClientCredentialDetailsResponse } from '@/app/_lib/definitions';

export default function CreateClientCredentials({ email }: { email: string }) {
  const initialState = { message: '', errors: {} };
  const createCredentialsWithEmail = createClientCredentials.bind(null, email);
  const [state, dispatch] = useFormState(createCredentialsWithEmail, initialState);
  const [currentClientCredentialDetails, setCurrentClientCredentialDetails] = useState<CurrentClientCredentialDetailsResponse | undefined>();

  useEffect(() => {
    async function fetchCurrentCredentialDetails() {
      if (email) {
        const credentialDetails = await fetchCurrentClientCredentialDetails(email);
        setCurrentClientCredentialDetails(credentialDetails);
      }
    }

    fetchCurrentCredentialDetails();
  }, [email]);

  const router = useRouter();
  const handleGoingBack = useCallback(() => {
    router.back();
  }, [router]);

  return (
    <>
      <div style={{marginRight: 'auto'}}>
        <Button type="text" label="Go Back" onClick={handleGoingBack} />
      </div>

      <Form action={dispatch} title="Create Client Credentials">
        <InputField
          type="text"
          name="applicationName"
          placeholder="Application name"
          errorMessage={state.errors?.applicationName?.[0]}
          initialValue={currentClientCredentialDetails?.applicationName}
        />
        <InputField
          type="text"
          name="redirectUri"
          placeholder="Redirect URI"
          errorMessage={state.errors?.redirectUri?.[0]}
          initialValue={currentClientCredentialDetails?.redirectUri}
        />
        <InputField
          type="text"
          name="webOrigin"
          placeholder="Web origin"
          errorMessage={state.errors?.webOrigin?.[0]}
          initialValue={currentClientCredentialDetails?.webOrigin}
        />
        
        <FormError errorMessage={state.message} />

        <Button label="Create Credentials" />
      </Form>
    </>
  );
}
