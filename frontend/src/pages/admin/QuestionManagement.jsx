import React, { useState, useEffect } from 'react';
import { HelpCircle, Plus, Edit2, Trash2, Search, Filter } from 'lucide-react';
import api from '../../services/api';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Modal } from '../../components/common/Modal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { DifficultyBadge, StatusBadge } from '../../components/common/Badge';
import toast from 'react-hot-toast';

export const QuestionManagement = () => {
  const [questions, setQuestions] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [questionToDelete, setQuestionToDelete] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedCompany, setSelectedCompany] = useState('All');

  // Form fields
  const [title, setTitle] = useState('');
  const [questionText, setQuestionText] = useState('');
  const [category, setCategory] = useState('Data Structures');
  const [difficulty, setDifficulty] = useState('Medium');
  const [companyId, setCompanyId] = useState('');
  const [topicTags, setTopicTags] = useState('');
  const [answer, setAnswer] = useState('');
  const [explanation, setExplanation] = useState('');
  const [codeSnippet, setCodeSnippet] = useState('');

  const categories = [
    'Data Structures',
    'Algorithms',
    'DBMS',
    'SQL',
    'Operating Systems',
    'Computer Networks',
    'MERN Stack',
    'Java',
    'Python',
    'Aptitude',
    'HR Interview',
  ];

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: 50 });
      if (search.trim()) params.append('search', search.trim());
      if (selectedCategory !== 'All') params.append('category', selectedCategory);
      if (selectedCompany !== 'All') params.append('companyId', selectedCompany);

      const [qRes, cRes] = await Promise.all([
        api.get(`/questions?${params.toString()}`),
        api.get('/companies?limit=100'),
      ]);

      if (qRes.data.success) setQuestions(qRes.data.data || []);
      if (cRes.data.success) setCompanies(cRes.data.data || []);
    } catch (err) {
      console.error('Failed to load questions', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, [selectedCategory, selectedCompany]);

  const handleOpenAdd = () => {
    setEditingQuestion(null);
    setTitle('');
    setQuestionText('');
    setCategory('Data Structures');
    setDifficulty('Medium');
    setCompanyId('');
    setTopicTags('');
    setAnswer('');
    setExplanation('');
    setCodeSnippet('');
    setModalOpen(true);
  };

  const handleOpenEdit = (q) => {
    setEditingQuestion(q);
    setTitle(q.title);
    setQuestionText(q.questionText);
    setCategory(q.category);
    setDifficulty(q.difficulty);
    setCompanyId(q.companyId?._id || q.companyId || '');
    setTopicTags(q.topicTags?.join(', ') || '');
    setAnswer(q.answer || '');
    setExplanation(q.explanation || '');
    setCodeSnippet(q.codeSnippet || '');
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const payload = {
      title: title.trim(),
      questionText: questionText.trim(),
      category: category.trim(),
      difficulty,
      companyId: companyId || null,
      topicTags: topicTags.split(',').map((s) => s.trim()).filter(Boolean),
      answer: answer.trim(),
      explanation: explanation.trim(),
      codeSnippet: codeSnippet.trim(),
      status: 'published',
    };

    try {
      if (editingQuestion) {
        const res = await api.put(`/admin/questions/${editingQuestion._id}`, payload);
        if (res.data.success) {
          toast.success('Question updated successfully!');
          fetchQuestions();
          setModalOpen(false);
        }
      } else {
        const res = await api.post('/admin/questions', payload);
        if (res.data.success) {
          toast.success('Question added to bank!');
          fetchQuestions();
          setModalOpen(false);
        }
      }
    } catch (err) {
      toast.error(err.friendlyMessage || 'Failed to save question');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!questionToDelete) return;
    setSubmitting(true);
    try {
      const res = await api.delete(`/admin/questions/${questionToDelete._id}`);
      if (res.data.success) {
        toast.success('Question deleted');
        fetchQuestions();
        setDeleteConfirmOpen(false);
      }
    } catch (err) {
      toast.error('Failed to delete question');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Question Bank Management
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Maintain curated practice problems, solution explanations, and code templates.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center space-x-2 px-4 py-2.5 bg-brand-blue hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm transition shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add Practice Question</span>
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-4 md:space-y-0 md:flex md:items-center md:justify-between md:space-x-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            fetchQuestions();
          }}
          className="relative flex-1"
        >
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search questions by title, problem text, tags..."
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </form>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 bg-white"
          >
            <option value="All">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <select
            value={selectedCompany}
            onChange={(e) => setSelectedCompany(e.target.value)}
            className="border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 bg-white"
          >
            <option value="All">All Companies</option>
            {companies.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>

          {(search || selectedCategory !== 'All' || selectedCompany !== 'All') && (
            <button
              onClick={() => {
                setSearch('');
                setSelectedCategory('All');
                setSelectedCompany('All');
              }}
              className="px-2.5 py-1.5 text-xs text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 font-semibold"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Questions Table */}
      {loading ? (
        <LoadingSpinner text="Loading questions..." size="lg" />
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100 text-left text-xs">
              <thead className="bg-slate-50/75 text-slate-400 font-bold uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">Title</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Difficulty</th>
                  <th className="px-6 py-4">Company Tag</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {questions.map((q) => (
                  <tr key={q._id} className="hover:bg-slate-50/50 transition">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900 max-w-sm truncate">{q.title}</div>
                      <div className="text-[11px] text-slate-400 max-w-xs truncate">
                        {q.questionText}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-800">{q.category}</td>
                    <td className="px-6 py-4">
                      <DifficultyBadge difficulty={q.difficulty} />
                    </td>
                    <td className="px-6 py-4 text-slate-500">{q.companyId?.name || 'General'}</td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => handleOpenEdit(q)}
                        className="p-1.5 border border-slate-200 hover:bg-slate-50 rounded-lg text-slate-700 transition"
                        title="Edit Question"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          setQuestionToDelete(q);
                          setDeleteConfirmOpen(true);
                        }}
                        className="p-1.5 border border-slate-200 hover:bg-rose-50 text-rose-600 rounded-lg transition"
                        title="Delete Question"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingQuestion ? 'Edit Question' : 'Add Practice Question'}
        maxWidth="max-w-3xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Question Title
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Reverse Nodes in k-Group"
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium bg-white"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Difficulty
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium bg-white"
              >
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Tagged Company
              </label>
              <select
                value={companyId}
                onChange={(e) => setCompanyId(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium bg-white"
              >
                <option value="">General Core Question</option>
                {companies.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Full Question Statement
            </label>
            <textarea
              rows={4}
              required
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              placeholder="Detailed problem formulation..."
              className="w-full border border-slate-200 rounded-xl p-3 text-xs leading-relaxed"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Summary Answer
            </label>
            <input
              type="text"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Brief answer summary..."
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Detailed Solution Explanation
            </label>
            <textarea
              rows={4}
              value={explanation}
              onChange={(e) => setExplanation(e.target.value)}
              placeholder="Step-by-step mathematical or algorithmic reasoning..."
              className="w-full border border-slate-200 rounded-xl p-3 text-xs leading-relaxed"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Code Snippet (Optional)
            </label>
            <textarea
              rows={4}
              value={codeSnippet}
              onChange={(e) => setCodeSnippet(e.target.value)}
              placeholder="// JavaScript / Java / C++ implementation"
              className="w-full border border-slate-200 rounded-xl p-3 text-xs font-mono"
            />
          </div>

          <div className="pt-2 flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-bold text-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 bg-brand-blue hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition disabled:opacity-50"
            >
              {submitting ? 'Saving...' : editingQuestion ? 'Save Changes' : 'Create Question'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirm Dialog */}
      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={handleDelete}
        title="Delete Question"
        message={`Are you sure you want to permanently delete "${questionToDelete?.title}"?`}
        confirmText="Delete Question"
        danger={true}
        loading={submitting}
      />
    </div>
  );
};
