import type { Metadata } from 'next';
import { Cormorant_Garamond, Montserrat } from 'next/font/google';
import './globals.css';

const cormorant = Cormorant_Garamond({
  subsets: ['cyrillic'],
  variable: '--font-cormorant',
});

const montserrat = Montserrat({
  subsets: ['cyrillic'],
  variable: '--font-montserrat',
});

export const metadata: Metadata = {
  title: 'Приглашение на свадьбу',
  description: 'Александр и Дарья - 28.08.2026',
    icons: '/favicon.ico',
};

export default function RootLayout({
                                     children,
                                   }: Readonly<{
  children: React.ReactNode;
}>) {
  return (
      <html lang="ru">
      <body className={`${cormorant.variable} ${montserrat.variable}`}>
      {children}
      </body>
      </html>
  );
}