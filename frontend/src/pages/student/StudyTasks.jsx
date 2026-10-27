import React, { useState, useEffect } from 'react';
import {
  CheckSquare,
  Plus,
  Trash2,
  Calendar,
  Clock,
  CheckCircle2,
  Circle,
  AlertCircle,
} from 'lucide-react';
import api from '../../services/api';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Modal } from '../../components/common/Modal';
import { EmptyState } from '../../components/common/EmptyState';
import toast from 'react-hot-toast';

export const StudyTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // New task form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState(
    new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const res = await api.get('/study-tasks');
      if (res.data.success) {
        setTasks(res.data.data || []);
      }
    } catch (err) {
      console.error('Failed to load tasks', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    setSubmitting(true);
    try {
      const res = await api.post('/study-tasks', {
        title: title.trim(),
        description: description.trim(),
        dueDate,
      });

      if (res.data.success) {
        toast.success('Study task created!');
        setTasks([res.data.data, ...tasks]);
        setTitle('');
        setDescription('');
        setAddModalOpen(false);
      }
    } catch (err) {
      toast.error('Failed to create task');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (task) => {
    const nextStatus = task.status === 'completed' ? 'pending' : 'completed';
    try {
      const res = await api.put(`/study-tasks/${task._id}`, { status: nextStatus });
      if (res.data.success) {
        setTasks(tasks.map((t) => (t._id === task._id ? res.data.data : t)));
        toast.success(nextStatus === 'completed' ? 'Task marked complete!' : 'Task re-opened.');
      }
    } catch (err) {
      toast.error('Failed to update task');
    }
  };

  const handleDelete = async (taskId) => {
    try {
      const res = await api.delete(`/study-tasks/${taskId}`);
      if (res.data.success) {
        setTasks(tasks.filter((t) => t._id !== taskId));
        toast.success('Task deleted');
      }
    } catch (err) {
      toast.error('Failed to delete task');
    }
  };

  const pendingCount = tasks.filter((t) => t.status === 'pending').length;
  const completedCount = tasks.filter((t) => t.status === 'completed').length;

  if (loading) {
    return <LoadingSpinner text="Loading your study task tracker..." size="lg" />;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Personal Preparation Tracker
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Set daily study tasks and weekly preparation goals to steadily boost your readiness.
          </p>
        </div>

        <button
          onClick={() => setAddModalOpen(true)}
          className="inline-flex items-center space-x-2 px-4 py-2.5 bg-brand-blue hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm transition shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add Study Goal</span>
        </button>
      </div>

      {/* Task Counters */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <span className="text-2xl font-bold text-amber-600">{pendingCount}</span>
          <span className="block text-xs text-slate-500 mt-1">Pending Goals</span>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <span className="text-2xl font-bold text-emerald-600">{completedCount}</span>
          <span className="block text-xs text-slate-500 mt-1">Completed Goals</span>
        </div>
      </div>

      {/* Task List */}
      {tasks.length === 0 ? (
        <EmptyState
          icon={CheckSquare}
          title="No study tasks created yet"
          description="Create your first goal, such as reviewing binary tree traversals or reading system design notes."
          actionText="Create Goal"
          onAction={() => setAddModalOpen(true)}
        />
      ) : (
        <div className="space-y-3">
          {tasks.map((task) => {
            const isDone = task.status === 'completed';
            return (
              <div
                key={task._id}
                className={`bg-white rounded-2xl border p-4 shadow-sm transition flex items-start justify-between gap-4 ${
                  isDone ? 'border-emerald-200 bg-emerald-50/10' : 'border-slate-200'
                }`}
              >
                <div
                  onClick={() => handleToggleStatus(task)}
                  className="flex items-start space-x-3.5 flex-1 cursor-pointer select-none"
                >
                  <div className="mt-0.5 shrink-0">
                    {isDone ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 fill-emerald-100" />
                    ) : (
                      <Circle className="w-5 h-5 text-slate-300 hover:text-blue-500 transition" />
                    )}
                  </div>
                  <div className="space-y-1">
                    <h3
                      className={`text-sm font-bold ${
                        isDone ? 'line-through text-slate-400' : 'text-slate-900'
                      }`}
                    >
                      {task.title}
                    </h3>
                    {task.description && (
                      <p className="text-xs text-slate-500 leading-relaxed">{task.description}</p>
                    )}
                    <div className="flex items-center space-x-1.5 text-[11px] text-slate-400 pt-1">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleDelete(task._id)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition shrink-0"
                  title="Delete Goal"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Task Modal */}
      <Modal isOpen={addModalOpen} onClose={() => setAddModalOpen(false)} title="Create New Study Goal">
        <form onSubmit={handleCreateTask} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Goal Title
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Solve 5 Graph BFS/DFS problems on LeetCode"
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Description (Optional)
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add key subtopics or problem numbers..."
              className="w-full border border-slate-200 rounded-xl p-3 text-xs leading-relaxed"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Target Due Date
            </label>
            <input
              type="date"
              required
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium"
            />
          </div>

          <div className="pt-2 flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => setAddModalOpen(false)}
              className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 bg-brand-blue hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition disabled:opacity-50"
            >
              {submitting ? 'Creating...' : 'Create Goal'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
