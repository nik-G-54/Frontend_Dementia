import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardLabel, SectionTitle } from '../components/ui/Card';
import { cn } from '../lib/utils';

export default function Login() {
  const [phone, setPhone] = useState('');
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone, pin }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify({ name: data.name, userId: data.userId }));
        navigate('/');
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (err) {
      setError('Could not connect to the backend server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-background-tertiary)] p-4">
      <Card className="max-w-md w-full shadow-lg p-8">
        <div className="text-center mb-8">
          <SectionTitle className="text-2xl mb-1">
            <span className="text-[#6d5cf7]">Cog</span>Guard
          </SectionTitle>
          <p className="text-[var(--color-text-secondary)] text-sm">
            Sign in to your account
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-xs p-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <CardLabel className="mb-1">Phone Number</CardLabel>
            <input
              type="tel"
              className="w-full bg-[var(--color-background-secondary)] border-[0.5px] border-[var(--color-border-secondary)] rounded-lg p-3 text-sm outline-none focus:border-[#6d5cf7] transition-colors"
              placeholder="Enter your phone number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </div>

          <div>
            <CardLabel className="mb-1">4-Digit PIN</CardLabel>
            <input
              type="password"
              maxLength="4"
              className="w-full bg-[var(--color-background-secondary)] border-[0.5px] border-[var(--color-border-secondary)] rounded-lg p-3 text-sm outline-none focus:border-[#6d5cf7] transition-colors"
              placeholder="Enter your PIN"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={cn(
              "w-full bg-[#6d5cf7] text-white rounded-lg p-3.5 text-sm font-medium hover:bg-[#5a4dd0] transition-colors mt-6",
              loading && "opacity-50 cursor-not-allowed"
            )}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p className="text-center mt-6 text-sm text-[var(--color-text-secondary)]">
          Don't have an account?{' '}
          <Link to="/signup" className="text-[#6d5cf7] font-medium hover:underline">
            Sign up
          </Link>
        </p>
      </Card>
    </div>
  );
}
