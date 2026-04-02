import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { Navbar } from './Navbar';

export function DashboardLayout() {
  // Try to use auth correctly if needed, for now just basic check
  const token = localStorage.getItem('token');

  // Uncomment if enforcing auth
  // if (!token) {
  //  return <Navigate to="/login" replace />;
  // }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300 font-sans text-gray-900 dark:text-gray-100 flex flex-col">
      <div className="max-w-[1400px] w-full mx-auto p-4 md:p-6 lg:p-8 flex-1 flex flex-col">
        <Navbar />
        <main className="flex-1 animate-in fade-in duration-500">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
