"use client";

import { useEffect, useState } from "react";
import { getTasks } from "@/lib/api/task";
import { useAuth } from "@/context/AuthContext";
import { CheckCircle2, Clock, AlertCircle, Calendar, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface Task { id: string | number; title: string; description?: string; status: 'pending' | 'in-progress' | 'completed'; priority: 'low' | 'medium' | 'high'; dueDate?: string; createdAt?: string; }

export default function TasksPage() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'in-progress' | 'completed'>('all');

  useEffect(() => { if (user) loadTasks(); }, [user]);

  const loadTasks = async () => {
    try {
      if (!user) return;
      const data = await getTasks(user.id);
      setTasks(data);
      setError(null);
    } catch (error) {
      console.error("Failed to load tasks:", error);
      setError("Failed to load tasks");
    } finally { setLoading(false); }
  };

  const filteredTasks = tasks.filter(task => filter === 'all' ? true : task.status === filter);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/20 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <Link href="/dashboard"><Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4 mr-2" />Back</Button></Link>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">All Tasks</h1>
            </div>
            <p className="text-gray-600 dark:text-gray-400">Manage and track all your tasks</p>
          </div>
          <Link href="/chat"><Button>Create Task</Button></Link>
        </div>
        <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
          {(['all', 'pending', 'in-progress', 'completed'] as const).map((status) => (
            <button key={status} onClick={() => setFilter(status)} className={`px-4 py-2 font-medium transition-colors border-b-2 ${filter === status ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400' : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'}`}>
              {status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
              <span className="ml-2 text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full">{status === 'all' ? tasks.length : tasks.filter(t => t.status === status).length}</span>
            </button>
          ))}
        </div>
        {error && (<div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl"><AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" /><span className="text-sm text-red-600 dark:text-red-400">{error}</span></div>)}
        {loading ? (<div className="space-y-3">{[1,2,3,4,5].map(i => <div key={i} className="h-24 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700" />)}</div>
        ) : filteredTasks.length === 0 ? (<div className="text-center py-12"><p className="text-gray-600 dark:text-gray-400">No {filter !== 'all' && filter} tasks found</p></div>
        ) : (<div className="space-y-3">{filteredTasks.map(task => (
          <div key={task.id} className="flex items-start gap-4 p-6 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:shadow-lg transition-all">
            {task.status === 'completed' ? <CheckCircle2 className="h-6 w-6 text-emerald-500 flex-shrink-0 mt-1" /> : task.status === 'in-progress' ? <AlertCircle className="h-6 w-6 text-amber-500 flex-shrink-0 mt-1" /> : <div className="h-6 w-6 rounded-full border-2 border-gray-300 dark:border-gray-600 flex-shrink-0 mt-1" />}
            <div className="flex-1 min-w-0 space-y-2">
              <h3 className={`text-lg font-semibold ${task.status === 'completed' ? 'line-through text-gray-500 dark:text-gray-400' : 'text-gray-900 dark:text-white'}`}>{task.title}</h3>
              {task.description && <p className="text-gray-600 dark:text-gray-400">{task.description}</p>}
              <div className="flex items-center gap-3 flex-wrap">
                <span className={`text-xs px-3 py-1 rounded-full font-medium ${task.priority === 'high' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : task.priority === 'medium' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'}`}>{task.priority} priority</span>
                <span className={`text-xs px-3 py-1 rounded-full font-medium ${task.status === 'completed' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : task.status === 'in-progress' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'}`}>{task.status}</span>
                {task.dueDate && <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1"><Calendar className="h-3 w-3" />{new Date(task.dueDate).toLocaleDateString()}</span>}
              </div>
            </div>
          </div>
        ))}</div>)}
      </div>
    </div>
  );
}
