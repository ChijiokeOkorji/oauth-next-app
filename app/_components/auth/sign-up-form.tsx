'use client'

import { useFormState } from 'react-dom';
import { createUser } from '@/app/_lib/actions';
import Form from '@/app/_components/form';
import InputField from '@/app/_components/input-field-component';
import FormError from '@/app/_components/form-error';
import Button from '@/app/_components/button';
import PromptButton from '@/app/_components/prompt-button';
import { useState } from 'react';

export default function SignUpForm() {
  const initialState = { message: '', errors: {} };
  const [state, dispatch] = useFormState(createUser, initialState);
  const [showValues, setShowValues] = useState(false);

  return (
    <>
      <Form action={dispatch} title="Sign Up Form">
        <InputField type="text" name="firstName" placeholder="First name" errorMessage={state.errors?.firstName?.[0]} />
        <InputField type="text" name="lastName" placeholder="Last name" errorMessage={state.errors?.lastName?.[0]} />
        <InputField type="email" name="email" placeholder="Email" errorMessage={state.errors?.email?.[0]} />
        <InputField type="password" name="password" placeholder="Password" errorMessage={state.errors?.password?.[0]} showValues={showValues} setShouldShowValues={setShowValues} />
        <InputField type="password" name="confirmPassword" placeholder="Confirm Password" errorMessage={state.errors?.confirmPassword?.[0]} showValues={showValues} setShouldShowValues={setShowValues} />
        
        <FormError errorMessage={state.message} />

        <Button label="Sign Up" />
      </Form>

      <PromptButton
        href="/auth/signin"
        prompt="Already have an account?"
        buttonLabel="Sign In"
      />
    </>
  );
}
