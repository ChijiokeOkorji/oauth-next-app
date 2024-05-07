'use server'
 
import { AxiosError } from 'axios';
import { z } from 'zod';
import { redirect } from 'next/navigation';
import prisma from '@/app/_lib/configs/db/prisma';
import { generateRandomApiKey } from '@/app/_lib/utils/shared-library';
import { UserState, ClientCredentialsState } from '@/app/_lib/definitions';
import { assignKeycloakRealmRole, createKeycloakClient, createKeycloakUser, getClientIdObject, regenerateClientSecret, updateKeycloakClient } from '@/app/_lib/utils/keycloak';
import { isAdminEmail } from './utils/regex-test';

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

export async function createUser(
  prevState: UserState,
  formData: FormData
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

  const { firstName, lastName, email } = validatedFields.data;

  try {
    let role;

    await createKeycloakUser(validatedFields.data);

    if (isAdminEmail(email)) {
      role = 'admin';
    } else {
      role = 'user';
    }

    await prisma.users.create({
      data: {
        first_name: firstName,
        last_name: lastName,
        email,
        auth: {
          create: {
            api_key: generateRandomApiKey(),
            role
          }
        }
      }
    });
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

  redirect('/auth/new-user');
}

export async function fetchUserAuthCredentials(email: string) {
  try {
    const { api_key, client_id } = await prisma.auths.findFirst({
      where: {
        user: {
          email
        },
      },
      select: {
        api_key: true,
        client_id: true
      },
    });

    let client_secret;

    if (client_id) {
      const { data } = await getClientIdObject(client_id);
      client_secret = data?.[0]?.secret;
    }

    return {
      api_key,
      client_id,
      client_secret
    };
  } catch (error) {
    console.error('Error retrieving user auth data: ', error);
  }
}

export async function generateNewApiKeys(email: string) {
  try {
    const { auth } = await prisma.users.update({
      where: {
        email
      }, 
      data: {
        auth: {
          update: {
            api_key: generateRandomApiKey()
          }
        }
      },
      select: {
        auth: {
          select: {
            api_key: true
          }
        }
      }
    });

    return auth;
  } catch (error) {
    console.error('Error generating new user API keys: ', error);
  }
}

const ClientCredentialsCreationSchema = z.object({
  applicationName: z.string().min(1, 'Enter a valid application name').max(100, 'Application name must be less than 100 characters'),
  redirectUri: z.string().url(),
  webOrigin: z.string().url()
});

export async function createClientCredentials(
  email: string,
  prevState: ClientCredentialsState,
  formData: FormData
) {
  const validatedFields = ClientCredentialsCreationSchema.safeParse({
    applicationName: formData.get('applicationName'),
    redirectUri: formData.get('redirectUri'),
    webOrigin: formData.get('webOrigin')
  });

  // If form validation fails, return errors early. Otherwise, continue.
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Invalid Fields. Failed to Create Credentials'
    };
  }

  const { applicationName, redirectUri, webOrigin } = validatedFields.data;

  try {
    const { client_id } = await prisma.auths.findFirst({
      where: {
        user: {
          email
        }
      },
      select: {
        client_id: true
      }
    });

    if (!client_id) {
      // Create new client credentials

      const newClientId = crypto.randomUUID();

      // Create the client on KeyCloak (no response body is sent for successful requests)
      await createKeycloakClient({
        clientId: newClientId,
        applicationName,
        redirectUri,
        webOrigin
      });

      // Insert the clientId into the database
      const { auth } = await prisma.users.update({
        where: {
          email
        }, 
        data: {
          auth: {
            update: {
              client_id: newClientId
            }
          }
        },
        select: {
          auth: {
            select: {
              role: true
            }
          }
        }
      });

      // Assign role to newly created client credentials
      await assignKeycloakRealmRole(newClientId, auth.role);
    } else {
      // Update client credentials

      // Fetch the client using its clientId to grab its ID
      const { data } = await getClientIdObject(client_id);
      const id: string = data?.[0]?.id;

      // Update all client parameters except the clientId (no response body is sent for successful requests)
      await updateKeycloakClient(id, {
        applicationName,
        redirectUri,
        webOrigin
      });

      // Regenerate random client secret
      await regenerateClientSecret(id);
    }
  } catch (error) {
    console.error('Unable to create credentials: ', error);

    if (error instanceof AxiosError && error.response?.status === 409) {
      return {
        message: error.response.data.errorMessage
      };
    }

    return {
      message: 'Unknown Error: Failed to Create Credentials',
    };
  }

  redirect('/dashboard');
}

export async function fetchCurrentClientCredentialDetails(email: string) {
  const { client_id } = await prisma.auths.findFirst({
    where: {
      user: {
        email
      }
    },
    select: {
      client_id: true
    }
  });

  if (client_id) {
    // Fetch the client using its clientId
    const { data } = await getClientIdObject(client_id);

    const name: string = data?.[0]?.name;
    const redirectUri: string = data?.[0]?.redirectUris[0];
    const webOrigin: string = data?.[0]?.webOrigins[0];

    return {
      applicationName: name,
      redirectUri,
      webOrigin
    }
  }
}
