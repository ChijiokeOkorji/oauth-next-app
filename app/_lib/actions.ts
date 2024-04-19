'use server'
 
import axios, { AxiosError } from 'axios';
import { z } from 'zod';
import { redirect } from 'next/navigation';
import prisma from '@/app/_lib/configs/db/prisma';
import { generateRandomApiKey } from '@/app/_lib/utils/randomApiKey';
import { UserState, ClientCredentialsState } from '@/app/_lib/definitions';

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

async function generateKeyCloakTokens() {
  return await axios.post(`${process.env.KEYCLOAK_ISSUER}/protocol/openid-connect/token`, {
    client_id: process.env.KEYCLOAK_CLIENT_ID || '',
    client_secret: process.env.KEYCLOAK_CLIENT_SECRET || '',
    grant_type: 'client_credentials'
  }, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  });
}

async function createKeyCloakUser({
  firstName, lastName, email, password
}: {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}) {
  const { data: tokenResponse } = await generateKeyCloakTokens();

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
    await createKeyCloakUser(validatedFields.data);

    await prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        auth: {
          create: {
            apiKey: generateRandomApiKey()
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
    const { apiKey, clientId } = await prisma.auth.findFirst({
      where: {
        user: {
          email: email
        },
      },
      select: {
        apiKey: true,
        clientId: true
      },
    });

    let clientSecret;

    if (clientId) {
      const { data: tokenResponse } = await generateKeyCloakTokens();

      const { data } = await axios.get(`${process.env.KEYCLOAK_ADMIN_ISSUER}/clients?clientId=${clientId}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${tokenResponse.access_token}`
        }
      });

      clientSecret = data?.[0]?.secret;
    }

    return {
      apiKey,
      clientId,
      clientSecret
    };
  } catch (error) {
    console.error('Error retrieving user auth data: ', error);
  }
}

export async function generateNewApiKeys(email: string) {
  try {
    const { auth } = await prisma.user.update({
      where: {
        email: email
      }, 
      data: {
        auth: {
          update: {
            apiKey: generateRandomApiKey()
          }
        }
      },
      select: {
        auth: {
          select: {
            apiKey: true
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
    const { clientId } = await prisma.auth.findFirst({
      where: {
        user: {
          email: email
        }
      },
      select: {
        clientId: true
      }
    });

    const { data: tokenResponse } = await generateKeyCloakTokens();

    if (!clientId) {
      const newClientId = crypto.randomUUID();

      // Create the client on KeyCloak (no response body is sent for successful requests)
      await axios.post(`${process.env.KEYCLOAK_ADMIN_ISSUER}/clients`, {
        clientId: newClientId,
        name: applicationName,
        redirectUris: [ redirectUri ],
        webOrigins: [ webOrigin ],
        standardFlowEnabled: false,
        serviceAccountsEnabled: true,
        attributes: {
          'pkce.code.challenge.method': 'S256'
        }
      }, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${tokenResponse.access_token}`
        }
      });

      // Insert the clientId into the database
      await prisma.user.update({
        where: {
          email: email
        }, 
        data: {
          auth: {
            update: {
              clientId: newClientId
            }
          }
        },
        select: {
          auth: {
            select: {
              clientId: true
            }
          }
        }
      });
    } else {
      // Fetch the client using its clientId to grab its ID
      const { data } = await axios.get(`${process.env.KEYCLOAK_ADMIN_ISSUER}/clients?clientId=${clientId}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${tokenResponse.access_token}`
        }
      });
      const id: string = data?.[0]?.id;

      // Update all client parameters except the clientId (no response body is sent for successful requests)
      await axios.put(`${process.env.KEYCLOAK_ADMIN_ISSUER}/clients/${id}`, {
        name: applicationName,
        redirectUris: [ redirectUri ],
        webOrigins: [ webOrigin ],
        standardFlowEnabled: false,
        serviceAccountsEnabled: true,
        attributes: {
          'pkce.code.challenge.method': 'S256'
        }
      }, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${tokenResponse.access_token}`
        }
      });

      // Update the client secret
      await axios.post(`${process.env.KEYCLOAK_ADMIN_ISSUER}/clients/${id}/client-secret`, {}, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${tokenResponse.access_token}`
        }
      });
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
  const { clientId } = await prisma.auth.findFirst({
    where: {
      user: {
        email: email
      }
    },
    select: {
      clientId: true
    }
  });

  if (clientId) {
    const { data: tokenResponse } = await generateKeyCloakTokens();

    // Fetch the client using its clientId
    const { data } = await axios.get(`${process.env.KEYCLOAK_ADMIN_ISSUER}/clients?clientId=${clientId}`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenResponse.access_token}`
      }
    });

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
