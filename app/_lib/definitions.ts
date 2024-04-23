export type keycloakRealmRolesObject = {
  id: string,
  name: string,
  description: string,
  composite: boolean,
  clientRole: boolean,
  containerId: string
};

export type UserState = {
  errors?: {
    firstName?: string[];
    lastName?: string[];
    email?: string[];
    password?: string[];
    confirmPassword?: string[];
  };
  message?: string;
};

export type ClientCredentialsState = {
  errors?: {
    applicationName?: string[];
    redirectUri?: string[];
    webOrigin?: string[];
  };
  message?: string;
};

export type UserAPICredentialsResponse = {
  api_key: string;
  client_id: string;
  client_secret: string;
};

export type CurrentClientCredentialDetailsResponse = {
  applicationName: string;
  redirectUri: string;
  webOrigin: string;
};
