import './globals.css';
import Sidebar from '@/components/Sidebar';

export const metadata = {
  title: 'OneStart - Start Assessoria Previdenciária',
  description: 'Sistema de gestão da Start Assessoria',
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body className="bg-cinza-bg text-cinza-escuro min-h-screen">
        <Sidebar />
        <main className="lg:ml-[260px] min-h-screen">
          {children}
        </main>
      </body>
    </html>
  );
}
