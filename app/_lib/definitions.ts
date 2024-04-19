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
  apiKey: string;
  clientId: string;
  clientSecret: string;
};

export type CurrentClientCredentialDetailsResponse = {
  applicationName: string;
  redirectUri: string;
  webOrigin: string;
};
