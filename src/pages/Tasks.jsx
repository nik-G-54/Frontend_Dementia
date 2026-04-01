import React, { useState } from 'react';
import { Card, SectionTitle, MiniLabel } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { TaskItem } from '../components/ui/TaskItem';

export default function Tasks() {
  const [tasks, setTasks] = useState([
    { id: 1, label: "Complete today's brain activity", dotColor: "#6d5cf7", done: true, category: 'Cognitive' },
    { id: 2, label: "Check in with your companion", dotColor: "#1D9E75", done: true, category: 'Social' },
    { id: 3, label: "5-minute gentle stretching", dotColor: "#3B8BD4", done: true, category: 'Physical' },
    { id: 4, label: "Name 5 things you can see right now", dotColor: "#EF9F27", done: false, category: 'Mental' },
    { id: 5, label: "Call a family member today", dotColor: "#1D9E75", done: false, category: 'Social' },
    { id: 6, label: "Drink 8 glasses of water", dotColor: "#3B8BD4", done: false, category: 'Physical' },
  ]);

  const toggleTask = (id) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t));
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
            <div className="text-3xl font-bold text-[#6d5cf7]">{Math.round((doneCount / tasks.length) * 100)}%</div>
            <MiniLabel>Today's completion</MiniLabel>
          </div>
        </div>
        <div className="w-full h-2 bg-[var(--color-background-secondary)] rounded-full mt-4 overflow-hidden">
          <div 
            className="h-full bg-[#6d5cf7] transition-all duration-500"
            style={{ width: `${(doneCount / tasks.length) * 100}%` }}
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
                <Badge variant="info" className="text-[9px]">Daily Rootine</Badge>
              </div>
              <div className="p-2 space-y-1">
                {catTasks.map(task => (
                  <div key={task.id} onClick={() => toggleTask(task.id)} className="cursor-pointer hover:bg-[var(--color-background-secondary)]/30 rounded-lg pr-4 transition-colors">
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
