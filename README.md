# Flutterwave Next App

## Overview

This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app) that utilizes [KeyCloak](https://www.keycloak.org/) for authentication.

This Next.js app is designed to allow authentication, authorization, and Single Sign-On (SSO). It includes public and protected routes and requires users to authenticate themselves using KeyCloak, and uses the same service for managing the access credentials. The app is built using Next.js, NextAuth, Prisma, and KeyCloak.

## Environment Variables

To run the Slack bot app, you need to set the following environment variables in a `.env` file:
```bash
# Ensure that dotenv is installed
SSH_KEY_PATH=~/.ssh/<PRIVATE_SSH_FILE_NAME>

KEYCLOAK_CLIENT_ID="<CLIENT_IF>"
KEYCLOAK_CLIENT_SECRET="<CLIENT_SECRET>"
KEYCLOAK_ISSUER="http://<KEYCLOAK_BASE_URL>/realms/<REALM>"
KEYCLOAK_ADMIN_ISSUER="http://<KEYCLOAK_BASE_URL>/admin/realms/<REALM>"

POSTGRES_PRISMA_URL="<POSTGRESQL_DATABASE_CONNECTION_URL>"

# `openssl rand -base64 32`
NEXTAUTH_SECRET=""
NEXTAUTH_URL="http://<APP_BASE_URL>"
```

Make sure to replace the variables with the actual secret values. A `.env.example` file has also been provided in the project's root directory. 

You can learn more about getting started with NextAuth and KeyCloak [here](https://next-auth.js.org/providers/keycloak).

If you do not intend to utilize SSH keys when pushing to the remote repository you can ignore the `SSH_KEY_PATH`, otherwise you can specify it and use the configured script for pushing to your remote repository:
```bash
npm run remote push --force

# The above command adds your SSH keys (you would be prompted to input the password for your SSH keys if you have that configured), runs 'git push --force' and then removes the SSH keys afterwards
```

## Getting Started

Next, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
