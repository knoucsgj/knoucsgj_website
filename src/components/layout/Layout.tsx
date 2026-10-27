import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { auth } from '../../services/auth';
import { Navbar } from './Navbar';
import { Footer } from './Footer';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const isAdminPath = location.pathname.startsWith('/admin');

  useEffect(() => {
    auth.refresh();
  }, [location.pathname]);

  if (isAdminPath) {
    return (
      <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col">
        {children}
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      <Navbar />
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
      <Footer />
    </div>
  );
};
