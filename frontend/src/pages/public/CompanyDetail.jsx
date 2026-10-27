import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Building2,
  ExternalLink,
  Briefcase,
  FileText,
  HelpCircle,
  BookOpen,
  ArrowRight,
  TrendingUp,
  MapPin,
  Clock,
  CheckCircle,
  Bookmark,
  Share2,
  Zap,
  PlusCircle,
  Video,
  Download,
  Lightbulb,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import api from '../../services/api';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { DifficultyBadge, StatusBadge, PlacementVerifiedBadge } from '../../components/common/Badge';
import { EmptyState } from '../../components/common/EmptyState';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export const CompanyDetail = () => {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const [company, setCompany] = useState(null);
  const [insights, setInsights] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('insights');

  useEffect(() => {
    const fetchCompanyData = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/companies/${id}`);
        if (res.data.success) {
          setCompany(res.data.data);

          // Fetch insights, questions & company study resources in parallel
          const compId = res.data.data._id;
          const [insightsRes, qRes, rRes] = await Promise.all([
            api.get(`/companies/${compId}/insights`),
            api.get(`/questions?companyId=${compId}&limit=20`),
            api.get(`/resources?companyId=${compId}&limit=20`),
          ]);

          if (insightsRes.data.success) {
            setInsights(insightsRes.data);
          }
          if (qRes.data.success) {
            setQuestions(qRes.data.data || []);
          }
          if (rRes.data.success) {
            setResources(rRes.data.data || []);
          }
        }
      } catch (err) {
        console.error('Failed to load company details', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCompanyData();
  }, [id]);

  const handleBookmarkResource = async (resourceId) => {
    if (!isAuthenticated) {
      toast.error('Log in to bookmark study resources!');
      return;
    }

    try {
      const res = await api.post('/bookmarks/toggle', {
        itemType: 'resource',
        itemId: resourceId,
      });
      if (res.data.success) {
        toast.success(res.data.message);
      }
    } catch (err) {
      toast.error('Failed to bookmark resource');
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading company profile, questions and resources..." size="lg" />;
  }

  if (!company) {
    return (
      <EmptyState
        icon={Building2}
        title="Company Not Found"
        description="The company profile you are searching for does not exist or has been archived."
        actionText="Back to Companies"
        actionLink="/companies"
      />
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Banner Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center space-x-5">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-slate-900 to-navy-800 text-white flex items-center justify-center font-black text-2xl shadow-md shrink-0">
              {company.name.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                  {company.name}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-brand-blue border border-blue-200">
                  {company.industry}
                </span>
              </div>
              <p className="text-xs text-slate-500 max-w-2xl leading-relaxed mt-2">
                {company.description}
              </p>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              to={`/submit-experience`}
              className="px-4 py-2.5 bg-brand-blue hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm transition flex items-center space-x-2"
            >
              <FileText className="w-4 h-4" />
              <span>Submit Experience</span>
            </Link>
            <Link
              to={`/smart-practice`}
              className="px-3.5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl shadow-sm transition flex items-center space-x-1.5"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Smart Practice</span>
            </Link>
            {company.website && (
              <a
                href={company.website}
                target="_blank"
                rel="noreferrer"
                className="px-3.5 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl transition flex items-center space-x-1.5"
              >
                <span>Website</span>
                <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
              </a>
            )}
          </div>
        </div>

        {/* Roles & Skills Ribbon */}
        <div className="mt-8 pt-6 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Eligible Job Roles
            </div>
            <div className="flex flex-wrap gap-1.5">
              {company.jobRoles?.map((role, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 text-slate-800"
                >
                  {role}
                </span>
              ))}
            </div>
          </div>

          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Required Skills & Technologies
            </div>
            <div className="flex flex-wrap gap-1.5">
              {company.skills?.map((skill, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-lg text-xs font-medium bg-emerald-50 text-emerald-800 border border-emerald-100"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Metric Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div
          onClick={() => setActiveTab('experiences')}
          className="bg-white rounded-2xl border border-slate-200 p-4 text-center cursor-pointer hover:border-slate-300 transition"
        >
          <div className="text-2xl font-bold text-navy-900">
            {company.stats?.approvedExperiencesCount || company.experiences?.length || 0}
          </div>
          <div className="text-xs font-medium text-slate-500 mt-1">Verified Experiences</div>
        </div>

        <div
          onClick={() => setActiveTab('questions')}
          className="bg-white rounded-2xl border border-slate-200 p-4 text-center cursor-pointer hover:border-blue-300 transition"
        >
          <div className="text-2xl font-bold text-brand-blue">
            {questions.length}
          </div>
          <div className="text-xs font-medium text-slate-500 mt-1">Practice Questions</div>
        </div>

        <div
          onClick={() => setActiveTab('resources')}
          className="bg-white rounded-2xl border border-slate-200 p-4 text-center cursor-pointer hover:border-purple-300 transition"
        >
          <div className="text-2xl font-bold text-purple-600">
            {resources.length}
          </div>
          <div className="text-xs font-medium text-slate-500 mt-1">Study Resources</div>
        </div>

        <div
          onClick={() => setActiveTab('drives')}
          className="bg-white rounded-2xl border border-slate-200 p-4 text-center cursor-pointer hover:border-emerald-300 transition"
        >
          <div className="text-2xl font-bold text-emerald-600">
            {company.placementDrives?.length || 0}
          </div>
          <div className="text-xs font-medium text-slate-500 mt-1">Placement Drives</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200 flex flex-wrap gap-4 sm:gap-6">
        <button
          onClick={() => setActiveTab('insights')}
          className={`pb-3 text-sm font-bold border-b-2 transition ${
            activeTab === 'insights'
              ? 'border-brand-blue text-brand-blue'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Pattern Insights ({insights?.sampleSize || 0})
        </button>
        <button
          onClick={() => setActiveTab('experiences')}
          className={`pb-3 text-sm font-bold border-b-2 transition ${
            activeTab === 'experiences'
              ? 'border-brand-blue text-brand-blue'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Approved Experiences ({company.experiences?.length || 0})
        </button>
        <button
          onClick={() => setActiveTab('advice')}
          className={`pb-3 text-sm font-bold border-b-2 transition flex items-center space-x-1.5 ${
            activeTab === 'advice'
              ? 'border-amber-500 text-amber-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Lightbulb className="w-4 h-4 text-amber-500" />
          <span>Senior Advice for Aspirants ({company.experiences?.filter((e) => e.advice)?.length || 0})</span>
        </button>
        <button
          onClick={() => setActiveTab('questions')}
          className={`pb-3 text-sm font-bold border-b-2 transition ${
            activeTab === 'questions'
              ? 'border-brand-blue text-brand-blue'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Company Questions ({questions.length})
        </button>
        <button
          onClick={() => setActiveTab('resources')}
          className={`pb-3 text-sm font-bold border-b-2 transition ${
            activeTab === 'resources'
              ? 'border-brand-blue text-brand-blue'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Study Resources ({resources.length})
        </button>
        <button
          onClick={() => setActiveTab('drives')}
          className={`pb-3 text-sm font-bold border-b-2 transition ${
            activeTab === 'drives'
              ? 'border-brand-blue text-brand-blue'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Placement Drives ({company.placementDrives?.length || 0})
        </button>
      </div>

      {/* Tab 1: Pattern Insights */}
      {activeTab === 'insights' && (
        <div className="space-y-6">
          <div className="bg-blue-50/70 border border-blue-200 rounded-2xl p-4 text-xs text-blue-900 leading-relaxed">
            <span className="font-bold">Insight Transparency Note:</span> These statistics are
            calculated from <span className="font-bold">{insights?.sampleSize || 0}</span> approved
            interview experiences submitted by verified selected students. They reflect historical
            recruitment patterns rather than a guaranteed interview script.
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Difficulty Breakdown */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
              <h3 className="text-sm font-bold text-slate-900">Reported Difficulty Breakdown</h3>
              <div className="space-y-3">
                {insights?.insights?.difficultyBreakdown?.map((item) => (
                  <div key={item.difficulty} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-700">{item.difficulty}</span>
                      <span className="text-slate-500">{item.count} report(s)</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${
                          item.difficulty === 'Easy'
                            ? 'bg-emerald-500'
                            : item.difficulty === 'Medium'
                            ? 'bg-amber-500'
                            : 'bg-rose-500'
                        }`}
                        style={{
                          width: `${
                            insights.sampleSize > 0
                              ? Math.round((item.count / insights.sampleSize) * 100)
                              : 0
                          }%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Common Round Sequence */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
              <h3 className="text-sm font-bold text-slate-900">Common Interview Stages</h3>
              <div className="space-y-2.5">
                {(insights?.insights?.roundTypeBreakdown || insights?.insights?.roundDistribution)?.map((item, idx) => (
                  <div
                    key={item.roundType}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs"
                  >
                    <div className="flex items-center space-x-2">
                      <span className="w-5 h-5 rounded-md bg-navy-900 text-white font-bold text-[10px] flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <span className="font-semibold text-slate-800">{item.roundType}</span>
                    </div>
                    <span className="text-slate-500 font-medium">{item.count} occurrences</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Advice Highlight on Insights */}
          {company.experiences?.some((e) => e.advice) && (
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl border border-amber-200 p-6 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-amber-900 flex items-center">
                  <Lightbulb className="w-4 h-4 mr-2 text-amber-600" />
                  Key Advice for Yet-to-be-Placed Students Targeting {company.name}
                </h3>
                <button
                  onClick={() => setActiveTab('advice')}
                  className="text-xs font-bold text-amber-800 hover:text-amber-900 underline"
                >
                  View All Advice Tips
                </button>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed italic bg-white/70 p-3.5 rounded-xl border border-amber-100">
                "{company.experiences.find((e) => e.advice)?.advice.split('\n')[0]}"
              </p>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Approved Experiences */}
      {activeTab === 'experiences' && (
        <div className="space-y-4">
          {company.experiences?.length === 0 ? (
            <EmptyState
              icon={FileText}
              title="No interview experiences published yet"
              description="Be the first student to share your recruitment journey for this company!"
              actionText="Submit Experience"
              actionLink="/submit-experience"
            />
          ) : (
            <div className="space-y-4">
              {company.experiences.map((exp) => (
                <div
                  key={exp._id}
                  className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:border-slate-300 transition space-y-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-base font-bold text-slate-900">{exp.jobRole}</span>
                      <DifficultyBadge difficulty={exp.difficulty} />
                    </div>
                    <span className="text-xs text-slate-400">
                      {new Date(exp.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <p className="text-xs text-slate-500">
                    Shared by: {exp.studentId?.name} ({exp.studentId?.department}) • Drive:{' '}
                    {exp.placementDriveId?.title}
                  </p>

                  <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                    {exp.preparationStrategy}
                  </p>

                  {exp.advice && (
                    <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-3 text-xs text-amber-900 space-y-1">
                      <div className="font-bold flex items-center text-amber-800">
                        <Lightbulb className="w-3.5 h-3.5 mr-1 text-amber-600" />
                        Advice to Yet-to-be-Placed Students:
                      </div>
                      <p className="line-clamp-2 leading-relaxed text-slate-700 whitespace-pre-line">
                        {exp.advice}
                      </p>
                    </div>
                  )}

                  <div className="pt-2 flex justify-end">
                    <Link
                      to={`/experiences/${exp._id}`}
                      className="text-xs font-bold text-brand-blue hover:text-blue-700 flex items-center space-x-1"
                    >
                      <span>Read Full Report ({exp.rounds?.length} Rounds)</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab: Senior Advice for Aspirants */}
      {activeTab === 'advice' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 border border-amber-200 rounded-3xl p-6 sm:p-8 space-y-4 shadow-xs">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold">
              <Lightbulb className="w-4 h-4 text-amber-600" />
              <span>Direct Guidance for Yet-to-be-Placed Students</span>
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              Seniors' Verified Advice for Cracking {company.name}
            </h2>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed max-w-3xl">
              Authentic tips, round-by-round strategies, and high-impact guidance shared by students who successfully cracked {company.name}'s recruitment rounds and verified their placement offers with the college administration.
            </p>
          </div>

          {company.experiences?.filter((e) => e.advice)?.length === 0 ? (
            <EmptyState
              icon={Lightbulb}
              title="No specific advice notes published yet"
              description={`Be the first placed candidate to share tips and advice for juniors targeting ${company.name}!`}
              actionText="Submit Experience & Advice"
              actionLink="/submit-experience"
            />
          ) : (
            <div className="space-y-6">
              {company.experiences
                .filter((e) => e.advice)
                .map((exp, idx) => (
                  <div
                    key={exp._id || idx}
                    className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-5"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-extrabold text-base text-slate-900">
                            {exp.jobRole} Selection
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            {exp.selectionOutcome}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mt-1">
                          <span>Verified Senior: {exp.studentId?.name} ({exp.studentId?.department})</span>
                          <PlacementVerifiedBadge verified={exp.studentId?.isPlacementVerified} />
                          <span>• Drive: {exp.placementDriveId?.title || 'Campus Drive'}</span>
                        </div>
                      </div>

                      <Link
                        to={`/experiences/${exp._id}`}
                        className="px-3.5 py-1.5 rounded-xl border border-blue-200 bg-blue-50 text-brand-blue hover:bg-blue-100 text-xs font-bold flex items-center space-x-1.5 transition"
                      >
                        <span>View Full Breakdown ({exp.rounds?.length} Rounds)</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>

                    <div className="bg-amber-50/60 rounded-2xl border border-amber-200/80 p-5 space-y-3">
                      <div className="text-xs font-bold uppercase tracking-wider text-amber-900 flex items-center">
                        <Sparkles className="w-4 h-4 mr-1.5 text-amber-600" />
                        Advice to Yet-to-be-Placed Juniors
                      </div>
                      <p className="text-xs sm:text-sm text-slate-800 leading-relaxed whitespace-pre-line font-medium">
                        {exp.advice}
                      </p>
                    </div>

                    {exp.preparationStrategy && (
                      <div className="space-y-1.5 text-xs">
                        <span className="font-bold text-slate-700">Preparation Strategy Summary:</span>
                        <p className="text-slate-600 leading-relaxed">{exp.preparationStrategy}</p>
                      </div>
                    )}
                  </div>
                ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Practice Questions */}
      {activeTab === 'questions' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-blue-50/60 border border-blue-200/80 rounded-2xl p-4">
            <div>
              <h3 className="text-sm font-bold text-navy-900">
                {company.name} Technical & Interview Questions ({questions.length})
              </h3>
              <p className="text-xs text-slate-600 mt-0.5">
                Practice specific coding questions, DBMS queries, and technical rounds asked by {company.name}.
              </p>
            </div>
            <div className="flex items-center space-x-2 shrink-0">
              {user?.role === 'admin' && (
                <Link
                  to="/admin/questions"
                  className="px-3.5 py-1.5 bg-white border border-slate-200 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-50 transition flex items-center space-x-1"
                >
                  <PlusCircle className="w-3.5 h-3.5 text-brand-blue" />
                  <span>Add Question</span>
                </Link>
              )}
              <Link
                to={`/smart-practice`}
                className="px-4 py-1.5 bg-brand-blue text-white text-xs font-bold rounded-xl hover:bg-blue-700 transition flex items-center space-x-1.5 shadow-xs"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Practice These</span>
              </Link>
            </div>
          </div>

          {questions.length === 0 ? (
            <EmptyState
              icon={HelpCircle}
              title={`No questions tagged specifically for ${company.name} yet`}
              description="Explore the global question bank or practice general topics."
              actionText="Open Question Bank"
              actionLink="/questions"
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {questions.map((q) => (
                <div
                  key={q._id}
                  className="bg-white rounded-2xl border border-slate-200 p-5 hover:border-blue-300 transition flex flex-col justify-between shadow-xs"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-brand-blue bg-blue-50 px-2.5 py-0.5 rounded-lg">
                        {q.category}
                      </span>
                      <DifficultyBadge difficulty={q.difficulty} />
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 line-clamp-2">{q.title}</h4>
                    <p className="text-xs text-slate-600 mt-2 line-clamp-3 leading-relaxed">
                      {q.questionText}
                    </p>

                    {q.topicTags?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-3">
                        {q.topicTags.map((tag, tIdx) => (
                          <span
                            key={tIdx}
                            className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-medium"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-center">
                    <span className="text-[11px] text-slate-400 font-medium">
                      {q.sourceType || 'Curated Practice'}
                    </span>
                    <Link
                      to={`/questions/${q._id}`}
                      className="text-xs font-bold text-brand-blue hover:text-blue-700 flex items-center space-x-1"
                    >
                      <span>View Solution</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Study Resources */}
      {activeTab === 'resources' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-purple-50/60 border border-purple-200/80 rounded-2xl p-4">
            <div>
              <h3 className="text-sm font-bold text-purple-900">
                Study & Preparation Materials for {company.name} ({resources.length})
              </h3>
              <p className="text-xs text-slate-600 mt-0.5">
                Company recruitment roadmaps, syllabus guides, PDF cheat sheets, and curated links.
              </p>
            </div>
            <div className="flex items-center space-x-2 shrink-0">
              {user?.role === 'admin' && (
                <Link
                  to="/admin/resources"
                  className="px-3.5 py-1.5 bg-white border border-slate-200 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-50 transition flex items-center space-x-1 shadow-xs"
                >
                  <PlusCircle className="w-3.5 h-3.5 text-purple-600" />
                  <span>Add Company Resource</span>
                </Link>
              )}
              <Link
                to="/resources"
                className="px-4 py-1.5 bg-purple-600 text-white text-xs font-bold rounded-xl hover:bg-purple-700 transition flex items-center space-x-1.5 shadow-xs"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Browse All Resources</span>
              </Link>
            </div>
          </div>

          {resources.length === 0 ? (
            <EmptyState
              icon={BookOpen}
              title={`No study resources tagged for ${company.name} yet`}
              description="Explore the global Study Resource Library for subject revision notes and aptitude materials."
              actionText="Visit Resource Library"
              actionLink="/resources"
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {resources.map((res) => (
                <div
                  key={res._id}
                  className="bg-white rounded-2xl border border-slate-200 p-5 hover:border-purple-300 transition flex flex-col justify-between shadow-xs"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-lg">
                        {res.category}
                      </span>
                      <span className="text-[11px] uppercase font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
                        {res.resourceType}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-slate-900 line-clamp-2">{res.title}</h4>
                    <p className="text-xs text-slate-600 mt-2 line-clamp-3 leading-relaxed">
                      {res.description}
                    </p>

                    {res.topicTags?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-3">
                        {res.topicTags.map((tag, tIdx) => (
                          <span
                            key={tIdx}
                            className="text-[10px] px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 font-medium"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <button
                      onClick={() => handleBookmarkResource(res._id)}
                      className="text-xs text-slate-400 hover:text-slate-600 flex items-center space-x-1"
                    >
                      <Bookmark className="w-3.5 h-3.5" />
                      <span>Bookmark</span>
                    </button>

                    {res.resourceUrl ? (
                      <a
                        href={res.resourceUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs font-bold text-purple-600 hover:text-purple-800 flex items-center space-x-1"
                      >
                        <span>Open Resource</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    ) : (
                      <span className="text-xs text-slate-400">Library Material</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 5: Placement Drives */}
      {activeTab === 'drives' && (
        <div className="space-y-4">
          {company.placementDrives?.length === 0 ? (
            <EmptyState
              icon={Building2}
              title="No placement drives registered"
              description="No active or past placement recruitment drives are recorded for this company."
            />
          ) : (
            company.placementDrives?.map((drive) => (
              <div
                key={drive._id}
                className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs"
              >
                <div>
                  <div className="flex items-center space-x-2">
                    <h4 className="text-base font-bold text-slate-900">{drive.title}</h4>
                    <StatusBadge status={drive.status} />
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    Year: <span className="font-bold">{drive.driveYear}</span> • Eligible:{' '}
                    {drive.eligibleDepartments?.join(', ')}
                  </div>
                </div>
                <Link
                  to="/submit-experience"
                  className="px-3 py-1.5 bg-blue-50 text-brand-blue hover:bg-blue-100 text-xs font-bold rounded-xl transition text-center shrink-0"
                >
                  Report Experience
                </Link>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
