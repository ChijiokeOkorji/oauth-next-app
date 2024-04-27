import axios from 'axios';

export async function generateKeycloakTokens() {
  return await axios.post(`${process.env.KEYCLOAK_ISSUER}/protocol/openid-connect/token`, {
    client_id: process.env.KEYCLOAK_CLIENT_ID || '',
    client_secret: process.env.KEYCLOAK_CLIENT_SECRET || '',
    grant_type: 'client_credentials'
  }, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  });
}

export async function createKeycloakUser({
  firstName, lastName, email, password
}: {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}) {
  const { data: tokenResponse } = await generateKeycloakTokens();

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

export async function createKeycloakClient({
  clientId, applicationName, redirectUri, webOrigin
}: {
  clientId: string,
  applicationName: string,
  redirectUri: string,
  webOrigin: string
}) {
  const { data: tokenResponse } = await generateKeycloakTokens();

  return await axios.post(`${process.env.KEYCLOAK_ADMIN_ISSUER}/clients`, {
    clientId: clientId,
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
}

export async function updateKeycloakClient(id: string, {
  applicationName, redirectUri, webOrigin
}: {
  applicationName: string,
  redirectUri: string,
  webOrigin: string
}) {
  const { data: tokenResponse } = await generateKeycloakTokens();

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
}

export async function regenerateClientSecret(id: string) {
  const { data: tokenResponse } = await generateKeycloakTokens();

  await axios.post(`${process.env.KEYCLOAK_ADMIN_ISSUER}/clients/${id}/client-secret`, {}, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${tokenResponse.access_token}`
    }
  });
}

export async function getClientIdObject(clientId: string) {
  const { data: tokenResponse } = await generateKeycloakTokens();

  return await axios.get(`${process.env.KEYCLOAK_ADMIN_ISSUER}/clients?clientId=${clientId}`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${tokenResponse.access_token}`
    }
  });
}

export async function getServiceAccountUserForClient(clientUUID: string) {
  const { data: tokenResponse } = await generateKeycloakTokens();

  return await axios.get(`${process.env.KEYCLOAK_ADMIN_ISSUER}/clients/${clientUUID}/service-account-user`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${tokenResponse.access_token}`
    }
  });
}

export async function getRealmRoleByName(roleName: string) {
  const { data: tokenResponse } = await generateKeycloakTokens();

  return await axios.get(`${process.env.KEYCLOAK_ADMIN_ISSUER}/roles/${roleName}`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${tokenResponse.access_token}`
    }
  });
}

export async function assignRealmRoleToClient(userId: string, roleName: string) {
  let { data: roleObject } = await getRealmRoleByName(roleName);

  const { data: tokenResponse } = await generateKeycloakTokens();

  return await axios.post(`${process.env.KEYCLOAK_ADMIN_ISSUER}/users/${userId}/role-mappings/realm`, [roleObject], {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${tokenResponse.access_token}`
    }
  });
}

export async function assignKeycloakRealmRole(clientId: string, roleName: string) {
  // Get clientId object
  const { data: clientIdObject } = await getClientIdObject(clientId);

  // Get service acount user for clientId object
  const { data: { id: userId } } = await getServiceAccountUserForClient(clientIdObject?.[0].id);

  // Assign real role to client
  await assignRealmRoleToClient(userId, roleName);
}
