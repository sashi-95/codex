import type { Metadata } from 'next';
import './globals.css';
import { Sidebar } from '@/components/layout/Sidebar';

export const metadata: Metadata = {
  title: 'NextGen Analytics Portal - Powered by SAP × Snowflake',
  description: 'Power BI を凌駕する次世代ダッシュボード＆レポーティングポータル',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="font-sans">
        <div className="flex min-h-screen">
          <Sidebar />
          <main className="flex-1 ml-64 p-8 custom-scrollbar overflow-y-auto">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
