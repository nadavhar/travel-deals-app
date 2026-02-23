import type { Metadata } from 'next';
import { Heebo } from 'next/font/google';
import './globals.css';

const heebo = Heebo({
  subsets: ['hebrew', 'latin'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'צייד הדילים — חופשה בתקציב שלך',
  description: 'מצאנו עבורך את הדילים הכי טובים בישראל — מסוננים, מאומתים ומוכנים לך',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="he" dir="rtl">
      <body className={`${heebo.className} antialiased bg-slate-50`}>{children}</body>
    </html>
  );
}
