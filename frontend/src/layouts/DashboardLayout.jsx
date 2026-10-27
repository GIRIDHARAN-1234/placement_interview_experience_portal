import React, { useState } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Sidebar } from '../components/layout/Sidebar';
import { Menu, Search, Bell, Home, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { GlobalSearchModal } from '../components/common/GlobalSearchModal';

export const DashboardLayout = () => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const { user, isAdmin } = useAuth();

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Sidebar */}
      <Sidebar isMobileOpen={isMobileOpen} setIsMobileOpen={setIsMobileOpen} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-slate-200 h-16 flex items-center justify-between px-4 sm:px-6">
          <div className="flex items-center space-x-3">
            {/* Mobile Toggle */}
            <button
              onClick={() => setIsMobileOpen(true)}
              className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Quick Breadcrumb */}
            <div className="hidden sm:flex items-center space-x-2 text-xs text-slate-500 font-medium">
              <Link to="/" className="hover:text-brand-blue flex items-center">
                <Home className="w-3.5 h-3.5 mr-1" /> Portal
              </Link>
              <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
              <span className="text-slate-800 font-bold capitalize">
                {isAdmin ? 'Admin Portal' : 'Student Portal'}
              </span>
            </div>
          </div>

          {/* Right Header Utilities */}
          <div className="flex items-center space-x-3">
            {/* Search Trigger */}
            <button
              onClick={() => setSearchModalOpen(true)}
              className="flex items-center space-x-2 text-xs text-slate-500 bg-slate-100 hover:bg-slate-200/80 px-3 py-1.5 rounded-lg border border-slate-200 transition"
            >
              <Search className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Search...</span>
              <kbd className="hidden sm:inline-block px-1.5 py-0.5 bg-white rounded border border-slate-300 font-mono text-[10px]">
                ⌘K
              </kbd>
            </button>

            {/* User Profile Badge */}
            <Link
              to="/profile"
              className="flex items-center space-x-2 p-1.5 rounded-lg hover:bg-slate-100 transition"
            >
              <div className="w-8 h-8 rounded-lg bg-navy-900 text-white flex items-center justify-center font-bold text-xs uppercase shadow-sm">
                {user?.name?.charAt(0) || 'U'}
              </div>
              <div className="hidden lg:block text-left pr-1">
                <div className="text-xs font-bold text-slate-800 leading-tight">
                  {user?.name?.split(' ')[0]}
                </div>
                <div className="text-[10px] text-slate-500 capitalize">{user?.role}</div>
              </div>
            </Link>
          </div>
        </header>

        {/* Content Outlet */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto overflow-y-auto">
          <Outlet />
        </main>
      </div>

      {/* Global Search Modal */}
      <GlobalSearchModal isOpen={searchModalOpen} onClose={() => setSearchModalOpen(false)} />
    </div>
  );
};
