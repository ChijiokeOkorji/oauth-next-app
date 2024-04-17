'use server'
 
import axios, { AxiosError } from 'axios';
import { z } from 'zod';
// import { sql } from '@vercel/postgres';
// import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

const UserCreationSchema = z.object({
  firstName: z.string().min(1, 'Enter a valid first name').max(50, 'First name must be less than 50 characters').regex(/^[a-zA-Z\s'-]+$/, 'Enter a valid first name'),
  lastName: z.string().min(1, 'Enter a valid last name').max(50, 'Last name must be less than 50 characters').regex(/^[a-zA-Z\s'-]+$/, 'Enter a valid last name'),
  email: z.string().email(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string().min(1, 'Enter a valid value'),
}).superRefine((data, ctx) => {
    if (data.password !== data.confirmPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["password"],
        fatal: true,
        message: "Passwords must match"
      });
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["confirmPassword"],
        fatal: true,
        message: "Passwords must match"
      });
    }
});

export type UserCreationState = {
  errors?: {
    firstName?: string[];
    lastName?: string[];
    email?: string[];
    password?: string[];
    confirmPassword?: string[];
  };
  message?: string;
};

async function createKeyCloakUser({
  firstName, lastName, email, password
}: {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}) {
  const { data: tokenResponse } = await axios.post(`${process.env.KEYCLOAK_ISSUER}/protocol/openid-connect/token`, {
    client_id: process.env.KEYCLOAK_CLIENT_ID || '',
    client_secret: process.env.KEYCLOAK_CLIENT_SECRET || '',
    grant_type: 'client_credentials'
  }, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  });

  // No response body is sent for successful requests
  await axios.post(`${process.env.KEYCLOAK_ADMIN_ISSUER}/users`, {
    username: email,
    email,
    firstName,
    lastName,
    emailVerified: false,
    enabled: true,
    credentials: [
      {
        temporary: false,
        type: 'password',
        value: password
      }
    ]
  }, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${tokenResponse.access_token}`
    }
  });
}

export async function createUser(
  prevState: UserCreationState,
  formData: FormData,
) {
  const validatedFields = UserCreationSchema.safeParse({
    firstName: formData.get('firstName'),
    lastName: formData.get('lastName'),
    email: formData.get('email'),
    password: formData.get('password'),
    confirmPassword: formData.get('confirmPassword')
  });

  // If form validation fails, return errors early. Otherwise, continue.
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Invalid Fields. Failed to Create User'
    };
  }

  // const { firstName, lastName, email, password } = validatedFields.data;

  try {
    createKeyCloakUser(validatedFields.data);
  } catch (error) {
    console.error('Unable to create user: ', error);

    if (error instanceof AxiosError && error.response?.status === 409) {
      return {
        message: error.response.data.errorMessage
      };
    }

    return {
      message: 'Unknown Error: Failed to Create User',
    };
  }

  redirect('/auth/signin');
}
