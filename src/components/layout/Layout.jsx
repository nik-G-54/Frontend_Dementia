import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { Navbar } from './Navbar';

export function Layout() {
  const token = localStorage.getItem('token');

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-[var(--color-background-tertiary)] flex flex-col">
      <div className="max-w-screen-xl mx-auto p-4 w-full flex-1 flex flex-col">
        <Navbar />
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
