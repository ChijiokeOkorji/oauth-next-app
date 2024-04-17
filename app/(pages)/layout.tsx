import type { Metadata } from 'next';
import { Providers } from '@/app/(pages)/auth/providers';
import SessionGuard from '@/app/(pages)/auth/session-guard';
import { Inter } from 'next/font/google';
import '@/app/_styles/main.scss';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    template: '%s | Flutterwave',
    default: 'Sign Up | Flutterwave'
  },
  description: 'A Next.js app built by Flutterwave'
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <SessionGuard>
            {children}
          </SessionGuard>
        </Providers>
      </body>
    </html>
  );
}
