import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

export function Layout() {
  const token = localStorage.getItem('token');
  const mode = localStorage.getItem('mode');

  if (!token && mode !== 'demo') {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="bg-surface text-on-surface min-h-screen font-body w-full">
      <Sidebar />
      <Topbar />
      <main className="ml-20 pt-20 flex flex-1 w-[calc(100%-5rem)] min-h-screen">
        <Outlet />
      </main>
    </div>
  );
}
