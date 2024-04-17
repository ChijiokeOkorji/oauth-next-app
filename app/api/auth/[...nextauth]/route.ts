import { AuthOptions } from 'next-auth';
import NextAuth from 'next-auth/next';
import KeycloakProvider from 'next-auth/providers/keycloak';

export const authOptions: AuthOptions = {
  providers: [
    KeycloakProvider({
      clientId: process.env.KEYCLOAK_CLIENT_ID,
      clientSecret: process.env.KEYCLOAK_CLIENT_SECRET,
      issuer: process.env.KEYCLOAK_ISSUER
    })
  ],
  pages: {
    signIn: '/auth/signin',
    signOut: '/auth/signout'
  },
  session: {
    strategy: "jwt",
    maxAge: 60 * 10 // The time before the JWT expires (seconds)
  },
  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        token.idToken = account.id_token;
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        token.expiresAt = account.expires_at;
      }
      
      return token;
    }
  }
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
