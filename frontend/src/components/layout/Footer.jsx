import React from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, ShieldCheck, Heart } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Column 1: Brand & Bio */}
          <div className="md:col-span-1 space-y-4">
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white">
                <GraduationCap className="w-5 h-5 text-emerald-400" />
              </div>
              <span className="text-lg font-extrabold text-white tracking-tight">
                Placement<span className="text-blue-400">Prep</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Official campus recruitment preparation platform. Empowering engineering students with
              verified senior interview experiences, company patterns, curated question banks, and
              preparation tracking.
            </p>
            <div className="flex items-center space-x-2 text-xs text-emerald-400 bg-slate-800/80 px-2.5 py-1 rounded border border-slate-700/60 w-fit">
              <ShieldCheck className="w-4 h-4" />
              <span>Verified Placement Records</span>
            </div>
          </div>

          {/* Column 2: Navigation */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">
              Explore Portal
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/companies" className="hover:text-white transition">
                  Company Directory
                </Link>
              </li>
              <li>
                <Link to="/experiences" className="hover:text-white transition">
                  Interview Experiences
                </Link>
              </li>
              <li>
                <Link to="/questions" className="hover:text-white transition">
                  Technical Question Bank
                </Link>
              </li>
              <li>
                <Link to="/resources" className="hover:text-white transition">
                  Study Resources Library
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Student Tools */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">
              Preparation Tools
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/practice" className="hover:text-white transition">
                  Smart Practice Mode
                </Link>
              </li>
              <li>
                <Link to="/roadmap" className="hover:text-white transition">
                  Company Prep Roadmaps
                </Link>
              </li>
              <li>
                <Link to="/analytics" className="hover:text-white transition">
                  Placement Readiness Score
                </Link>
              </li>
              <li>
                <Link to="/submit-experience" className="hover:text-white transition">
                  Submit Verified Experience
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Institutional & Privacy */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">
              College & Support
            </h4>
            <ul className="space-y-2 text-xs">
              <li className="text-slate-400">Department of Placement & Training</li>
              <li className="text-slate-400">Email: placement-cell@college.edu</li>
              <li className="text-slate-400">Office: Main Campus, Tech Block</li>
              <li className="pt-2">
                <span className="text-[11px] text-slate-500">
                  Strict student privacy: Personal register numbers and private contact details are
                  never published publicly.
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
          <p>© 2026 PlacementPrep Portal. Built for Engineering College Placements.</p>
          <p className="flex items-center mt-2 sm:mt-0">
            Crafted for final-year placement success
          </p>
        </div>
      </div>
    </footer>
  );
};
