import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardLabel, SectionTitle, MiniLabel } from '../components/ui/Card';
import { cn } from '../lib/utils';

export default function Signup() {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    pin: '',
    age: '',
    education: '',
    livesAlone: false,
    caregiverPhone: '',
    caregiverEmail: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          age: parseInt(formData.age),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify({ name: data.name, userId: data.userId }));
        navigate('/');
      } else {
        setError(data.message || 'Registration failed');
      }
    } catch (err) {
      setError('Could not connect to the backend server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-background-tertiary)] p-4 sm:p-8">
      <Card className="max-w-xl w-full shadow-lg p-8 sm:p-12">
        <div className="text-center mb-8">
          <SectionTitle className="text-2xl mb-1">
            <span className="text-[#6d5cf7]">Cog</span>Guard
          </SectionTitle>
          <p className="text-[var(--color-text-secondary)] text-sm">
            Create an account to start tracking your cognitive health
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-xs p-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSignup} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <CardLabel className="mb-1">Full Name</CardLabel>
              <input
                type="text"
                name="name"
                className="w-full bg-[var(--color-background-secondary)] border-[0.5px] border-[var(--color-border-secondary)] rounded-lg p-3 text-sm outline-none focus:border-[#6d5cf7] transition-colors"
                placeholder="Rajesh Kumar"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </div>
            <div>
              <CardLabel className="mb-1">Phone Number</CardLabel>
              <input
                type="tel"
                name="phone"
                className="w-full bg-[var(--color-background-secondary)] border-[0.5px] border-[var(--color-border-secondary)] rounded-lg p-3 text-sm outline-none focus:border-[#6d5cf7] transition-colors"
                placeholder="10-digit phone number"
                value={formData.phone}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <CardLabel className="mb-1">4-Digit PIN</CardLabel>
              <input
                type="password"
                name="pin"
                maxLength="4"
                className="w-full bg-[var(--color-background-secondary)] border-[0.5px] border-[var(--color-border-secondary)] rounded-lg p-3 text-sm outline-none focus:border-[#6d5cf7] transition-colors"
                placeholder="4-digit secure code"
                value={formData.pin}
                onChange={handleInputChange}
                required
              />
            </div>
            <div>
              <CardLabel className="mb-1">Your Age</CardLabel>
              <input
                type="number"
                name="age"
                className="w-full bg-[var(--color-background-secondary)] border-[0.5px] border-[var(--color-border-secondary)] rounded-lg p-3 text-sm outline-none focus:border-[#6d5cf7] transition-colors"
                placeholder="60+"
                value={formData.age}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          <div>
            <CardLabel className="mb-1">Education Level</CardLabel>
            <select
              name="education"
              className="w-full bg-[var(--color-background-secondary)] border-[0.5px] border-[var(--color-border-secondary)] rounded-lg p-3 text-sm outline-none focus:border-[#6d5cf7] transition-colors appearance-none"
              value={formData.education}
              onChange={handleInputChange}
              required
            >
              <option value="" disabled>Select your education</option>
              <option value="none">No formal education</option>
              <option value="primary">Primary School</option>
              <option value="secondary">Secondary School</option>
              <option value="graduate">Graduate (Degree)</option>
            </select>
          </div>

          <div className="flex items-center gap-2 py-2">
            <input
              type="checkbox"
              id="livesAlone"
              name="livesAlone"
              className="w-4 h-4 rounded-[var(--border-radius-md)] accent-[#6d5cf7]"
              checked={formData.livesAlone}
              onChange={handleInputChange}
            />
            <label htmlFor="livesAlone" className="text-sm text-[var(--color-text-secondary)]">I live alone</label>
          </div>

          <div className="border-t border-[var(--color-border-tertiary)] pt-6 mt-6">
            <MiniLabel className="mb-4 block text-[var(--color-text-primary)] font-medium">Caregiver Information (Optional)</MiniLabel>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <CardLabel className="mb-1">Caregiver Phone</CardLabel>
                <input
                  type="tel"
                  name="caregiverPhone"
                  className="w-full bg-[var(--color-background-secondary)] border-[0.5px] border-[var(--color-border-secondary)] rounded-lg p-3 text-sm outline-none focus:border-[#6d5cf7] transition-colors"
                  placeholder="Their phone number"
                  value={formData.caregiverPhone}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <CardLabel className="mb-1">Caregiver Email</CardLabel>
                <input
                  type="email"
                  name="caregiverEmail"
                  className="w-full bg-[var(--color-background-secondary)] border-[0.5px] border-[var(--color-border-secondary)] rounded-lg p-3 text-sm outline-none focus:border-[#6d5cf7] transition-colors"
                  placeholder="Their email address"
                  value={formData.caregiverEmail}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={cn(
              "w-full bg-[#6d5cf7] text-white rounded-lg p-3.5 text-sm font-medium hover:bg-[#5a4dd0] transition-colors mt-8",
              loading && "opacity-50 cursor-not-allowed"
            )}
          >
            {loading ? "Registering Account..." : "Create Account"}
          </button>
        </form>

        <p className="text-center mt-6 text-sm text-[var(--color-text-secondary)]">
          Already have an account?{' '}
          <Link to="/login" className="text-[#6d5cf7] font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </Card>
    </div>
  );
}
