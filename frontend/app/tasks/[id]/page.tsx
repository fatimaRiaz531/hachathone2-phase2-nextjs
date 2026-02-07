'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { apiClient } from '../../../lib/api';
import { TaskForm } from '../../../src/components/tasks/TaskForm';
import { Button } from '../../../src/components/ui/Button';
import { Badge } from '../../../src/components/ui/Badge';
import { ArrowLeft, Edit3, Trash2, CheckCircle, Clock, Sparkles } from 'lucide-react';


export default function TaskDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [task, setTask] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) {
      fetchTask();
    }
  }, [id]);

  const fetchTask = async () => {
    try {
      setLoading(true);
      const data = await apiClient.get(`/tasks/${id}`);
      setTask(data);
    } catch (error: any) {
      setError(error.message || 'Error fetching task');
      console.error('Error fetching task:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this task?')) {
      try {
        await apiClient.delete(`/tasks/${id}`);
        router.push('/dashboard');
      } catch (error: any) {
        setError(error.message || 'Error deleting task');
        console.error('Error deleting task:', error);
      }
    }
  };

  const handleToggleComplete = async () => {
    try {
      const updatedTask = await apiClient.patch(`/tasks/${id}`, {
        status: task.status === 'completed' ? 'pending' : 'completed'
      });
      setTask(updatedTask);
    } catch (error: any) {
      setError(error.message || 'Error updating task');
      console.error('Error updating task:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground font-bold uppercase tracking-widest text-xs">Loading task...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="bg-card border-2 border-primary/20 p-12 rounded-[2.5rem] shadow-2xl text-center max-w-md">
          <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <Trash2 className="w-10 h-10 text-primary" />
          </div>
          <p className="text-foreground font-bold mb-8">{error}</p>
          <Button onClick={() => router.back()} className="w-full py-6 rounded-2xl">
            Return to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4 font-black uppercase tracking-widest">Task not found</p>
          <Button onClick={() => router.back()} variant="outline">
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/20">
      <header className="bg-primary py-8 shadow-xl shadow-primary/10">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="p-3 bg-white/10 hover:bg-white/20 rounded-2xl transition-all text-white border border-white/10"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-3xl font-black uppercase tracking-tighter text-white">Task Details</h1>
          <div className="w-12 h-12" /> {/* Spacer */}
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12">
        {editing ? (
          <div className="bg-card p-10 rounded-[2.5rem] shadow-2xl border border-border animate-in zoom-in-95 duration-300">
            <h2 className="text-3xl font-black uppercase tracking-tight mb-8">Edit <span className="text-primary italic">Task</span></h2>
            <TaskForm
              task={task}
              onSuccess={(updatedTask) => {
                setTask(updatedTask);
                setEditing(false);
              }}
              onCancel={() => setEditing(false)}
            />
          </div>
        ) : (
          <div className="bg-card p-10 rounded-[2.5rem] shadow-2xl border border-border transition-all">
            <div className="flex flex-col md:flex-row justify-between items-start gap-8 mb-12">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 font-black uppercase tracking-widest px-4 py-1.5">
                    {task.priority.toUpperCase()} Priority
                  </Badge>
                  <Badge className={`font-black uppercase tracking-widest px-4 py-1.5 border-none ${task.status === 'completed' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-amber-500/10 text-amber-600'
                    }`}>
                    {task.status.replace('_', ' ')}
                  </Badge>
                </div>
                <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-foreground leading-[1.1] mb-6">
                  {task.title}
                </h2>
                {task.description && (
                  <p className="text-lg text-muted-foreground leading-relaxed font-semibold">
                    {task.description}
                  </p>
                )}
              </div>

              <div className="flex shrink-0 gap-3">
                <Button
                  onClick={() => setEditing(true)}
                  variant="outline"
                  className="rounded-2xl h-14 w-14 border-2 p-0"
                >
                  <Edit3 className="w-6 h-6" />
                </Button>
                <Button
                  onClick={handleDelete}
                  variant="destructive"
                  className="rounded-2xl h-14 w-14 p-0 shadow-lg shadow-destructive/20"
                >
                  <Trash2 className="w-6 h-6" />
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 py-10 border-t border-border/50">
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-muted/50 rounded-2xl">
                    <Clock className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div>
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 mb-1">Timeline</h4>
                    <p className="text-sm font-bold text-foreground">
                      Created {new Date(task.created_at).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-muted-foreground font-semibold">
                      Updated {new Date(task.updated_at).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              </div>

              {task.due_date && (
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-primary/5 rounded-2xl">
                    <Sparkles className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-primary/60 mb-1">Due Date</h4>
                    <p className="text-sm font-black text-foreground">
                      {new Date(task.due_date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <Button
              onClick={handleToggleComplete}
              className={`w-full mt-10 py-8 rounded-[1.5rem] font-black uppercase tracking-[0.2em] text-sm shadow-2xl transition-all ${task.status === 'completed'
                ? 'bg-muted text-foreground'
                : 'bg-primary text-white shadow-primary/30'
                }`}
            >
              {task.status === 'completed' ? 'Reopen Task' : '✓ Complete Task'}
            </Button>
          </div>
        )}

        <div className="mt-12 text-center">
          <button
            onClick={() => router.push('/dashboard')}
            className="text-xs font-black uppercase tracking-[0.3em] text-muted-foreground hover:text-primary transition-colors flex items-center justify-center gap-3 mx-auto group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Dashboard
          </button>
        </div>
      </main>
    </div>
  );
}
