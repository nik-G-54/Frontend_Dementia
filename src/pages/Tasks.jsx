import React, { useState, useEffect } from 'react';
import { Card, SectionTitle, MiniLabel } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { TaskItem } from '../components/ui/TaskItem';
import api from '../api/axiosInstance';

const DEFAULT_TASKS = [
  { _id: '1', label: "Complete today's brain activity", dotColor: "#6d5cf7", done: true, category: 'Cognitive' },
  { _id: '2', label: "Check in with your companion", dotColor: "#1D9E75", done: true, category: 'Social' },
  { _id: '3', label: "5-minute gentle stretching", dotColor: "#3B8BD4", done: true, category: 'Physical' },
  { _id: '4', label: "Name 5 things you can see right now", dotColor: "#EF9F27", done: false, category: 'Mental' },
  { _id: '5', label: "Call a family member today", dotColor: "#1D9E75", done: false, category: 'Social' },
  { _id: '6', label: "Drink 8 glasses of water", dotColor: "#3B8BD4", done: false, category: 'Physical' },
];

const DOT_COLORS = {
  Cognitive: '#6d5cf7',
  Social: '#1D9E75',
  Physical: '#3B8BD4',
  Mental: '#EF9F27',
};

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/tasks')
      .then(res => {
        const fetched = res.data;
        if (Array.isArray(fetched) && fetched.length > 0) {
          setTasks(fetched.map(t => ({
            ...t,
            _id: t._id || t.id,
            label: t.label || t.title,
            dotColor: t.dotColor || DOT_COLORS[t.category] || '#6d5cf7',
          })));
        } else {
          setTasks(DEFAULT_TASKS);
        }
      })
      .catch(() => setTasks(DEFAULT_TASKS))
      .finally(() => setLoading(false));
  }, []);

  const toggleTask = async (id) => {
    const task = tasks.find(t => t._id === id);
    if (!task) return;

    const newDone = !task.done;
    // Optimistic update
    setTasks(prev => prev.map(t => t._id === id ? { ...t, done: newDone } : t));

    try {
      await api.patch(`/tasks/${id}`, { done: newDone });
    } catch {
      // Revert on failure
      setTasks(prev => prev.map(t => t._id === id ? { ...t, done: !newDone } : t));
    }
  };

  const doneCount = tasks.filter(t => t.done).length;

  return (
    <div className="w-full max-w-3xl mx-auto">
      <header className="mb-8">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Daily Checklist</h1>
            <p className="text-[var(--color-text-secondary)]">Small consistent actions lead to long-term brain health.</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-[#6d5cf7]">{tasks.length > 0 ? Math.round((doneCount / tasks.length) * 100) : 0}%</div>
            <MiniLabel>Today's completion</MiniLabel>
          </div>
        </div>
        <div className="w-full h-2 bg-[var(--color-background-secondary)] rounded-full mt-4 overflow-hidden">
          <div 
            className="h-full bg-[#6d5cf7] transition-all duration-500"
            style={{ width: `${tasks.length > 0 ? (doneCount / tasks.length) * 100 : 0}%` }}
          ></div>
        </div>
      </header>

      <div className="space-y-4">
        {['Cognitive', 'Social', 'Physical', 'Mental'].map(cat => {
          const catTasks = tasks.filter(t => t.category === cat);
          if (catTasks.length === 0) return null;
          
          return (
            <Card key={cat} className="p-0 overflow-hidden">
              <div className="px-4 py-3 bg-[var(--color-background-secondary)]/50 border-b border-[var(--color-border-tertiary)] flex justify-between items-center">
                <SectionTitle className="m-0 text-sm">{cat} Growth</SectionTitle>
                <Badge variant="info" className="text-[9px]">Daily Routine</Badge>
              </div>
              <div className="p-2 space-y-1">
                {catTasks.map(task => (
                  <div key={task._id} onClick={() => toggleTask(task._id)} className="cursor-pointer hover:bg-[var(--color-background-secondary)]/30 rounded-lg pr-4 transition-colors">
                    <TaskItem 
                      done={task.done} 
                      dotColor={task.dotColor} 
                      label={task.label} 
                      className="border-none py-3"
                    />
                  </div>
                ))}
              </div>
            </Card>
          );
        })}
      </div>

      <Card className="mt-8 bg-[#6d5cf7]/5 border-dashed border-[#6d5cf7]/40 text-center py-8">
        <p className="text-sm text-[var(--color-text-secondary)] italic">
          "Consistency is more important than intensity." 
          <br />You've maintained a 12-day streak!
        </p>
      </Card>
    </div>
  );
}
