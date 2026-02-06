"use client";

import { useEffect, useState } from "react";
import { getTasks } from "@/lib/api/task";
import { useAuth } from "@/context/AuthContext";
import { CheckCircle2, Clock, ListTodo, TrendingUp, Sparkles, Calendar, AlertCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface TaskStats { total: number; completed: number; pending: number; completionRate: number; }
interface Task { id: string | number; title: string; description?: string; status: 'pending' | 'in-progress' | 'completed'; priority: 'low' | 'medium' | 'high'; dueDate?: string; createdAt?: string; }

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<TaskStats>({ total: 0, completed: 0, pending: 0, completionRate: 0 });
  const [recentTasks, setRecentTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { if (user) loadTaskStats(); }, [user]);

  const loadTaskStats = async () => {
    try {
      if (!user) return;
      const tasks = await getTasks(user.id);
      const total = tasks.length;
      const completed = tasks.filter(task => task.status === 'completed').length;
      const pending = total - completed;
      const rate = total > 0 ? Math.round((completed / total) * 100) : 0;
      setStats({ total, completed, pending, completionRate: rate });
      setRecentTasks(tasks.slice(0, 5));
      setError(null);
    } catch (error) {
      console.error("Failed to load stats:", error);
      setError("Failed to load tasks");
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/20 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-900 dark:from-white dark:via-blue-200 dark:to-purple-200 bg-clip-text text-transparent">Dashboard Overview</h1>
          <p className="text-gray-600 dark:text-gray-400">Welcome back, {user?.name || 'User'}! Here's your task summary.</p>
        </div>
        {error && (<div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl"><AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" /><span className="text-sm text-red-600 dark:text-red-400">{error}</span></div>)}
        <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {[{icon: ListTodo, label: 'Total Tasks', value: stats.total, color: 'blue'}, {icon: CheckCircle2, label: 'Completed', value: stats.completed, color: 'emerald'}, {icon: Clock, label: 'Pending', value: stats.pending, color: 'amber'}, {icon: TrendingUp, label: 'Completion Rate', value: `${stats.completionRate}%`, color: 'purple'}].map(({icon: Icon, label, value, color}) => (
            <div key={label} className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800 transition-all hover:shadow-xl hover:scale-105">
              <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-${color}-500/10 to-transparent rounded-full -mr-16 -mt-16`} />
              <div className="relative space-y-3">
                <div className="flex items-center gap-2">
                  <div className={`p-2 rounded-lg bg-${color}-100 dark:bg-${color}-900/30`}><Icon className={`w-5 h-5 text-${color}-600 dark:text-${color}-400`} /></div>
                  <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">{label}</h3>
                </div>
                {loading ? <div className="h-10 w-24 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700" /> : <p className={`text-4xl font-bold text-${color}-600 dark:text-${color}-400`}>{value}</p>}
              </div>
            </div>
          ))}
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Recent Tasks</h2>
            <Link href="/dashboard/tasks"><Button variant="outline" size="sm">View All</Button></Link>
          </div>
          {loading ? (<div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-16 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700" />)}</div>
          ) : recentTasks.length === 0 ? (
            <div className="text-center py-8"><Sparkles className="w-8 h-8 text-gray-400 mx-auto mb-3" /><h3 className="text-lg font-semibold text-gray-900 dark:text-white">No tasks yet!</h3><p className="text-gray-600 dark:text-gray-400">Start by creating a task in the chat.</p><Link href="/chat"><Button className="mt-4 bg-blue-600 hover:bg-blue-700">Go to Chat</Button></Link></div>
          ) : (<div className="space-y-3">{recentTasks.map(task => (
            <div key={task.id} className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
              {task.status === 'completed' ? <CheckCircle2 className="h-5 w-5 text-emerald-500 flex-shrink-0" /> : task.status === 'in-progress' ? <AlertCircle className="h-5 w-5 text-amber-500 flex-shrink-0" /> : <div className="h-5 w-5 rounded-full border-2 border-gray-300 dark:border-gray-600 flex-shrink-0" />}
              <div className="flex-1 min-w-0"><p className={`font-medium truncate ${task.status === 'completed' ? 'line-through text-gray-500' : 'text-gray-900 dark:text-white'}`}>{task.title}</p></div>
              <span className={`text-xs px-2 py-1 rounded-full ${task.priority === 'high' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : task.priority === 'medium' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'}`}>{task.priority}</span>
            </div>
          ))}</div>)}
        </div>
      </div>
    </div>
  );
}
