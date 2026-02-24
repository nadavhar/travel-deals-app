import type { Metadata } from 'next';
import { Rubik } from 'next/font/google';
import './globals.css';

const rubik = Rubik({
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
      <body className={`${rubik.className} antialiased bg-gray-50`}>{children}</body>
    </html>
  );
}
