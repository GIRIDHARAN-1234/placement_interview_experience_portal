import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  GraduationCap,
  Search,
  Menu,
  X,
  User as UserIcon,
  LogOut,
  LayoutDashboard,
  Bookmark,
  FileText,
  ShieldAlert,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { GlobalSearchModal } from '../common/GlobalSearchModal';

export const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Companies', path: '/companies' },
    { name: 'Experiences', path: '/experiences' },
    { name: 'Question Bank', path: '/questions' },
    { name: 'Study Resources', path: '/resources' },
  ];

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const handleLogout = async () => {
    await logout();
    setUserDropdownOpen(false);
    navigate('/');
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <Link to="/" className="flex items-center space-x-2.5">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-slate-900 to-indigo-800 flex items-center justify-center text-white shadow-md">
                  <GraduationCap className="w-6 h-6 text-emerald-400" />
                </div>
                <div>
                  <span className="text-lg font-extrabold tracking-tight text-slate-900">
                    Placement<span className="text-brand-blue">Prep</span>
                  </span>
                  <span className="hidden sm:inline-block ml-1.5 px-1.5 py-0.2 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded uppercase tracking-wider">
                    Portal
                  </span>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-3 py-2 rounded-lg text-sm font-semibold transition ${
                    isActive(link.path)
                      ? 'text-brand-blue bg-blue-50/80 font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </nav>

            {/* Actions: Search & Auth */}
            <div className="hidden md:flex items-center space-x-3">
              {/* Quick Search Trigger */}
              <button
                onClick={() => setSearchModalOpen(true)}
                className="flex items-center space-x-2 text-xs text-slate-500 bg-slate-100 hover:bg-slate-200/80 px-3 py-1.5 rounded-lg border border-slate-200 transition"
                title="Global Search (Ctrl+K)"
              >
                <Search className="w-3.5 h-3.5" />
                <span>Search...</span>
                <kbd className="px-1.5 py-0.5 bg-white rounded border border-slate-300 font-mono text-[10px]">
                  ⌘K
                </kbd>
              </button>

              {isAuthenticated ? (
                <div className="relative">
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center space-x-2.5 p-1.5 rounded-xl hover:bg-slate-100 transition border border-slate-200/60"
                  >
                    <div className="w-8 h-8 rounded-lg bg-navy-900 text-white flex items-center justify-center font-bold text-xs uppercase shadow-sm">
                      {user.name?.charAt(0)}
                    </div>
                    <div className="text-left hidden lg:block pr-1">
                      <div className="text-xs font-bold text-slate-800 leading-tight">
                        {user.name.split(' ')[0]}
                      </div>
                      <div className="text-[10px] text-slate-500 capitalize">{user.role}</div>
                    </div>
                  </button>

                  {/* Dropdown Menu */}
                  {userDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-100 py-1.5 z-50 animate-fade-in">
                      <div className="px-4 py-2 border-b border-slate-100">
                        <p className="text-xs font-medium text-slate-400">Signed in as</p>
                        <p className="text-sm font-bold text-slate-900 truncate">{user.name}</p>
                        <p className="text-xs text-slate-500 truncate">{user.email}</p>
                      </div>

                      <Link
                        to={isAdmin ? '/admin/dashboard' : '/dashboard'}
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-brand-blue"
                      >
                        <LayoutDashboard className="w-4 h-4 mr-2.5 text-slate-400" />
                        {isAdmin ? 'Admin Dashboard' : 'Student Dashboard'}
                      </Link>

                      {!isAdmin && (
                        <>
                          <Link
                            to="/my-experiences"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-brand-blue"
                          >
                            <FileText className="w-4 h-4 mr-2.5 text-slate-400" />
                            My Submissions
                          </Link>
                          <Link
                            to="/bookmarks"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-brand-blue"
                          >
                            <Bookmark className="w-4 h-4 mr-2.5 text-slate-400" />
                            My Bookmarks
                          </Link>
                        </>
                      )}

                      <Link
                        to="/profile"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-brand-blue"
                      >
                        <UserIcon className="w-4 h-4 mr-2.5 text-slate-400" />
                        My Profile
                      </Link>

                      <div className="border-t border-slate-100 my-1"></div>

                      <button
                        onClick={handleLogout}
                        className="w-full text-left flex items-center px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50"
                      >
                        <LogOut className="w-4 h-4 mr-2.5" />
                        Log out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Link
                    to="/login"
                    className="px-3.5 py-2 text-sm font-semibold text-slate-700 hover:text-slate-900 transition"
                  >
                    Log In
                  </Link>
                  <Link
                    to="/register"
                    className="px-4 py-2 bg-navy-900 hover:bg-slate-800 text-white text-sm font-semibold rounded-lg shadow-sm transition"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Hamburger Button */}
            <div className="flex md:hidden items-center space-x-2">
              <button
                onClick={() => setSearchModalOpen(true)}
                className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                <Search className="w-5 h-5" />
              </button>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-3">
            <div className="space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-3 py-2 rounded-lg text-base font-semibold ${
                    isActive(link.path)
                      ? 'bg-blue-50 text-brand-blue'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </div>

            <div className="border-t border-slate-100 pt-3">
              {isAuthenticated ? (
                <div className="space-y-2">
                  <div className="px-3 py-1">
                    <p className="text-sm font-bold text-slate-900">{user.name}</p>
                    <p className="text-xs text-slate-500">{user.email}</p>
                  </div>
                  <Link
                    to={isAdmin ? '/admin/dashboard' : '/dashboard'}
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Profile
                  </Link>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleLogout();
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg text-sm font-semibold text-rose-600 hover:bg-rose-50"
                  >
                    Log Out
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-center py-2.5 px-4 text-sm font-semibold border border-slate-300 rounded-lg text-slate-700"
                  >
                    Log In
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-center py-2.5 px-4 text-sm font-semibold bg-navy-900 text-white rounded-lg"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Global Search Modal */}
      <GlobalSearchModal isOpen={searchModalOpen} onClose={() => setSearchModalOpen(false)} />
    </>
  );
};
