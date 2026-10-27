import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Building2,
  FileText,
  HelpCircle,
  BookOpen,
  MapPin,
  Bookmark,
  CheckSquare,
  BarChart2,
  PlusCircle,
  Users,
  Briefcase,
  Award,
  CheckCircle2,
  History,
  LogOut,
  ChevronLeft,
  ChevronRight,
  User,
  Zap,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Sidebar = ({ isMobileOpen, setIsMobileOpen }) => {
  const [collapsed, setCollapsed] = useState(false);
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const studentNav = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Companies', path: '/companies', icon: Building2 },
    { name: 'Experiences', path: '/experiences', icon: FileText },
    { name: 'Question Bank', path: '/questions', icon: HelpCircle },
    { name: 'Smart Practice', path: '/practice', icon: Zap },
    { name: 'Study Resources', path: '/resources', icon: BookOpen },
    { name: 'Prep Roadmap', path: '/roadmap', icon: MapPin },
    { name: 'My Bookmarks', path: '/bookmarks', icon: Bookmark },
    { name: 'Study Tasks', path: '/tasks', icon: CheckSquare },
    { name: 'Readiness Analytics', path: '/analytics', icon: BarChart2 },
    { name: 'Submit Experience', path: '/submit-experience', icon: PlusCircle },
  ];

  const adminNav = [
    { name: 'Admin Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Manage Students', path: '/admin/students', icon: Users },
    { name: 'Manage Companies', path: '/admin/companies', icon: Building2 },
    { name: 'Placement Drives', path: '/admin/placement-drives', icon: Briefcase },
    { name: 'Placement Offers', path: '/admin/placement-offers', icon: Award },
    { name: 'Moderation Queue', path: '/admin/experiences', icon: CheckCircle2 },
    { name: 'Question Bank', path: '/admin/questions', icon: HelpCircle },
    { name: 'Study Resources', path: '/admin/resources', icon: BookOpen },
    { name: 'Audit Logs', path: '/admin/audit-logs', icon: History },
  ];

  const navItems = isAdmin ? adminNav : studentNav;

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 md:hidden"
          onClick={() => setIsMobileOpen(false)}
        ></div>
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed md:sticky top-0 left-0 z-50 md:z-30 h-screen bg-navy-950 text-slate-300 flex flex-col justify-between transition-all duration-300 ease-in-out border-r border-slate-800 ${
          collapsed ? 'w-20' : 'w-64'
        } ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Top Header */}
        <div>
          <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800">
            {!collapsed && (
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-brand-blue flex items-center justify-center font-bold text-white shadow-sm">
                  P
                </div>
                <div>
                  <span className="font-extrabold text-sm text-white tracking-tight">PlacementPrep</span>
                  <span className="block text-[10px] text-emerald-400 font-semibold uppercase">
                    {isAdmin ? 'Admin Console' : 'Student Portal'}
                  </span>
                </div>
              </div>
            )}
            {collapsed && (
              <div className="w-8 h-8 mx-auto rounded-lg bg-brand-blue flex items-center justify-center font-bold text-white">
                P
              </div>
            )}

            {/* Collapse toggle (Desktop only) */}
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="hidden md:flex p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-140px)]">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMobileOpen && setIsMobileOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center px-3 py-2.5 rounded-xl text-xs font-semibold transition group ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-900/30 font-bold'
                        : 'text-slate-400 hover:text-white hover:bg-slate-900'
                    }`
                  }
                  title={collapsed ? item.name : undefined}
                >
                  <Icon
                    className={`w-4 h-4 shrink-0 transition ${
                      collapsed ? 'mx-auto' : 'mr-3'
                    }`}
                  />
                  {!collapsed && <span className="truncate">{item.name}</span>}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* User Footer Card */}
        <div className="p-3 border-t border-slate-800">
          <div
            className={`flex items-center rounded-xl bg-slate-900/80 p-2.5 ${
              collapsed ? 'justify-center' : 'justify-between'
            }`}
          >
            <div className="flex items-center space-x-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-lg bg-slate-800 text-white flex items-center justify-center font-bold text-xs uppercase shrink-0">
                {user?.name?.charAt(0) || 'U'}
              </div>
              {!collapsed && (
                <div className="overflow-hidden">
                  <div className="text-xs font-bold text-white truncate">{user?.name}</div>
                  <div className="text-[10px] text-slate-400 truncate capitalize">{user?.role}</div>
                </div>
              )}
            </div>

            {!collapsed && (
              <button
                onClick={handleLogout}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition"
                title="Log Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};
