import React from 'react';

const TaskItem = ({ title, time, completed, type, onToggle }) => {
  const typeColors = {
    game: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
    chat: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    webcam: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400',
    activity: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  };

  const typeLabels = {
    game: 'Brain Game',
    chat: 'AI Chat',
    webcam: 'Webcam Scan',
    activity: 'Physical'
  };

  return (
    <div className={`p-4 rounded-xl border flex items-center gap-4 transition-all duration-200 ${
      completed 
        ? 'bg-gray-50 border-gray-100 dark:bg-gray-800/50 dark:border-gray-800 opacity-60' 
        : 'bg-white border-gray-100 dark:bg-gray-800 dark:border-gray-700 hover:shadow-md hover:border-blue-200 dark:hover:border-blue-800'
    }`}>
      <div 
        onClick={onToggle}
        className={`w-6 h-6 rounded-full flex items-center justify-center cursor-pointer transition-colors ${
          completed 
            ? 'bg-blue-500 text-white' 
            : 'border-2 border-gray-300 dark:border-gray-600 hover:border-blue-500'
        }`}
      >
        {completed && <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>}
      </div>
      
      <div className="flex-1">
        <h4 className={`text-sm font-semibold ${completed ? 'text-gray-400 line-through' : 'text-gray-900 dark:text-gray-100'}`}>
          {title}
        </h4>
        <div className="flex gap-3 text-xs mt-1">
          <span className="text-gray-500 flex items-center gap-1">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            {time}
          </span>
        </div>
      </div>
      
      <div className={`px-3 py-1 rounded-full text-xs font-semibold ${typeColors[type] || typeColors.activity}`}>
        {typeLabels[type] || 'Task'}
      </div>
    </div>
  );
};

const TasksListWidget = () => {
  const [tasks, setTasks] = React.useState([
    { id: 1, title: "Complete Sequence Memory", time: "10 mins", type: "game", completed: true },
    { id: 2, title: "Daily Check-in Chat", time: "5 mins", type: "chat", completed: false },
    { id: 3, title: "Webcam Expression Scan", time: "2 mins", type: "webcam", completed: false },
    { id: 4, title: "Afternoon Walk", time: "20 mins", type: "activity", completed: false }
  ]);

  const toggleTask = (id) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const completedCount = tasks.filter(t => t.completed).length;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col h-full">
      <div className="flex justify-between items-center mb-5">
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Today's Protocol</h3>
          <p className="text-sm text-gray-500">{completedCount} of {tasks.length} completed</p>
        </div>
        <div className="w-12 h-12 rounded-full border-4 border-blue-100 dark:border-blue-900 flex items-center justify-center relative">
          <svg className="absolute w-full h-full transform -rotate-90" viewBox="0 0 36 36">
            <path
              className="text-blue-500"
              strokeDasharray={`${(completedCount / tasks.length) * 100}, 100`}
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
            />
          </svg>
          <span className="text-sm font-bold text-blue-600 dark:text-blue-400">{Math.round((completedCount/tasks.length)*100)}%</span>
        </div>
      </div>

      <div className="flex flex-col gap-3 flex-1 overflow-y-auto pr-1 pb-1">
        {tasks.map(task => (
          <TaskItem key={task.id} {...task} onToggle={() => toggleTask(task.id)} />
        ))}
      </div>
      
      <button className="w-full mt-4 py-3 bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 rounded-xl text-sm font-bold hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors">
        View All Tasks
      </button>
    </div>
  );
};

export default TasksListWidget;
