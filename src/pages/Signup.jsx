import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardLabel, SectionTitle, MiniLabel } from '../components/ui/Card';
import { cn } from '../lib/utils';
import { User, Phone, Lock, Calendar, GraduationCap, Mail, ArrowRight } from 'lucide-react';
import api from '../api/axiosInstance';

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
      const { data } = await api.post('/auth/register', {
        ...formData,
        age: parseInt(formData.age),
      });
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify({ name: data.name, userId: data.userId, age: data.age }));
      navigate('/');
    } catch (err) {
      const msg = err.response?.data?.message || 'Could not connect to the backend server.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#f7f9fb] text-[#191c1e] min-h-screen overflow-y-hidden flex flex-col relative" style={{ fontFamily: "'Public Sans', sans-serif" }}>
      {/* Google Fonts */}
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Lexend:wght@400;500;700;800&family=Public+Sans:wght@400;500;600&display=swap');
        .font-headline { font-family: 'Lexend', sans-serif; }
        .font-body { font-family: 'Public Sans', sans-serif; }
      `}} />

      {/* Abstract background shapes */}
      <div 
        className="fixed z-0 blur-[80px] opacity-40 rounded-full w-[600px] h-[600px] -top-[200px] -right-[200px]"
        style={{ background: 'radial-gradient(circle, #a7c8ff 0%, #d4e3ff 100%)' }}
      ></div>
      <div 
        className="fixed z-0 blur-[80px] opacity-40 rounded-full w-[500px] h-[500px] -bottom-[150px] -left-[150px]"
        style={{ background: 'radial-gradient(circle, #70aeff 0%, #a4c9ff 100%)' }}
      ></div>

      <main className="flex-grow flex items-center justify-center px-4 py-4 md:py-6 relative z-10 w-full max-w-7xl mx-auto">
        <div className="w-full max-w-5xl grid lg:grid-cols-5 bg-white rounded-2xl overflow-hidden mx-auto" style={{ boxShadow: '0 40px 100px -20px rgba(0, 30, 64, 0.12)' }}>
          
          {/* Left Side: Visual Welcome - Using 2 columns out of 5 to give form more space */}
          <div className="hidden lg:flex lg:col-span-2 flex-col justify-center items-center p-6 bg-gradient-to-br from-[#001e40] to-[#003366] text-white relative overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <svg className="w-full h-full" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <path d="M0 50 Q 25 25, 50 50 T 100 50" fill="none" stroke="white" strokeWidth="2"></path>
              </svg>
            </div>
            <div className="relative z-10 text-center space-y-3">
               <div className="max-w-[60%] max-h-50 mx-auto bg-white/10 backdrop-blur-md p-2 shadow-inner rounded-2xl flex items-center justify-center overflow-hidden">
                 <img alt="CogGuard Brand" className="w-full h-auto max-h-48 object-contain rounded-xl" src="/WhatsApp%20Image%202026-04-03%20at%2000.22.30.jpeg"/>
              </div>
              <div className="space-y-2 px-2">
                <h2 className="font-headline font-extrabold text-2xl tracking-tight">Join Us!</h2>
                <p className="font-body text-white/80 text-base leading-relaxed">
                  Create an account to start your journey of tracking cognitive health with gentle guidance.
                </p>
              </div>
            </div>
          </div>
          
          {/* Right Side: Signup Form - 3 columns out of 5 */}
          <div className="lg:col-span-3 p-4 md:p-6 flex flex-col justify-center">
            
            <div className="mb-4">
              <h1 className="font-headline font-extrabold text-xl md:text-2xl text-[#001e40] mb-1">Create Account</h1>
              <p className="text-[#43474f] font-body text-sm">Fill in the details below to securely register</p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm font-medium p-3 rounded-xl mb-6">
                {error}
              </div>
            )}

            <form className="space-y-3" onSubmit={handleSignup}>
              
              {/* Row 1: Name and Phone */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block font-headline font-semibold text-[#001e40] text-sm" htmlFor="name">
                    Full Name
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="text-[#737780] group-focus-within:text-[#075fab] transition-colors" size={18} />
                    </div>
                    <input 
                      className="block w-full pl-10 pr-3 py-2 bg-[#e6e8ea] border-2 border-transparent rounded-xl text-sm font-body focus:bg-white focus:border-[#075fab]/30 focus:outline-none transition-all placeholder:text-[#737780]/60" 
                      id="name" 
                      name="name" 
                      placeholder="e.g. John Doe" 
                      type="text"
                      value={formData.name}
                      onChange={handleInputChange}
                      required 
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block font-headline font-semibold text-[#001e40] text-sm" htmlFor="phone">
                    Phone Number
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Phone className="text-[#737780] group-focus-within:text-[#075fab] transition-colors" size={18} />
                    </div>
                    <input 
                      className="block w-full pl-10 pr-3 py-2 bg-[#e6e8ea] border-2 border-transparent rounded-xl text-sm font-body focus:bg-white focus:border-[#075fab]/30 focus:outline-none transition-all placeholder:text-[#737780]/60" 
                      id="phone" 
                      name="phone" 
                      placeholder="e.g. 9876543210" 
                      type="tel"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required 
                    />
                  </div>
                </div>
              </div>

              {/* Row 2: PIN and Age */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block font-headline font-semibold text-[#001e40] text-sm" htmlFor="pin">
                    4-digit PIN
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="text-[#737780] group-focus-within:text-[#075fab] transition-colors" size={18} />
                    </div>
                    <input 
                      className="block w-full pl-10 pr-3 py-2 bg-[#e6e8ea] border-2 border-transparent rounded-xl text-sm font-body focus:bg-white focus:border-[#075fab]/30 focus:outline-none transition-all tracking-[0.3em] placeholder:tracking-normal placeholder:text-[#737780]/60" 
                      id="pin" 
                      inputMode="numeric" 
                      name="pin" 
                      pattern="[0-9]*" 
                      placeholder="••••" 
                      type="password"
                      maxLength={4}
                      value={formData.pin}
                      onChange={handleInputChange}
                      required 
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block font-headline font-semibold text-[#001e40] text-sm" htmlFor="age">
                    Your Age
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Calendar className="text-[#737780] group-focus-within:text-[#075fab] transition-colors" size={18} />
                    </div>
                    <input 
                      className="block w-full pl-10 pr-3 py-2 bg-[#e6e8ea] border-2 border-transparent rounded-xl text-sm font-body focus:bg-white focus:border-[#075fab]/30 focus:outline-none transition-all placeholder:text-[#737780]/60" 
                      id="age" 
                      name="age" 
                      placeholder="e.g. 65" 
                      type="number"
                      value={formData.age}
                      onChange={handleInputChange}
                      required 
                    />
                  </div>
                </div>
              </div>

              {/* Row 3: Education Level and Care Status */}
              <div className="space-y-1.5">
                <label className="block font-headline font-semibold text-[#001e40] text-sm" htmlFor="education">
                  Education Level
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <GraduationCap className="text-[#737780] group-focus-within:text-[#075fab] transition-colors" size={18} />
                  </div>
                  <select 
                    className="block w-full pl-10 pr-3 py-2 bg-[#e6e8ea] border-2 border-transparent rounded-xl text-sm font-body focus:bg-white focus:border-[#075fab]/30 focus:outline-none transition-all appearance-none text-[#191c1e]" 
                    id="education" 
                    name="education" 
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
              </div>

              <div className="flex items-center gap-2 mt-1">
                <input
                  type="checkbox"
                  id="livesAlone"
                  name="livesAlone"
                  className="w-4 h-4 rounded text-[#075fab] bg-[#e6e8ea] border-transparent focus:ring-[#075fab] focus:ring-offset-0 transition-colors cursor-pointer"
                  checked={formData.livesAlone}
                  onChange={handleInputChange}
                />
                <label htmlFor="livesAlone" className="text-sm font-semibold text-[#43474f] cursor-pointer">
                  I currently live alone
                </label>
              </div>

              {/* Row 4 (Optional Caregiver split) */}
              <div className="border-t border-[#e0e3e5] pt-3 mt-2">
                <h3 className="font-headline font-semibold text-[#001e40] text-xs uppercase tracking-wider mb-2">Caregiver Info (Optional)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Phone className="text-[#737780] group-focus-within:text-[#075fab] transition-colors" size={18} />
                      </div>
                      <input 
                        className="block w-full pl-10 pr-3 py-2 bg-[#e6e8ea] border-2 border-transparent rounded-xl text-sm font-body focus:bg-white focus:border-[#075fab]/30 focus:outline-none transition-all placeholder:text-[#737780]/60" 
                        name="caregiverPhone" 
                        placeholder="Caregiver's Phone Number" 
                        type="tel"
                        value={formData.caregiverPhone}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="text-[#737780] group-focus-within:text-[#075fab] transition-colors" size={18} />
                      </div>
                      <input 
                        className="block w-full pl-10 pr-3 py-2 bg-[#e6e8ea] border-2 border-transparent rounded-xl text-sm font-body focus:bg-white focus:border-[#075fab]/30 focus:outline-none transition-all placeholder:text-[#737780]/60" 
                        name="caregiverEmail" 
                        placeholder="Caregiver's Email Address" 
                        type="email"
                        value={formData.caregiverEmail}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-[#001e40] text-white font-headline font-bold text-base py-3.5 rounded-2xl shadow-lg hover:bg-[#003366] active:scale-[0.98] transition-all flex items-center justify-center gap-3 mt-3 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? "Registering..." : "Create Account"}
                {!loading && <ArrowRight size={20} />}
              </button>
            </form>

            <div className="mt-4 text-center">
              <p className="font-body text-[#43474f] text-sm">
                Already have an account?{' '}
                <Link to="/login" className="text-[#075fab] font-bold hover:underline ml-1">Sign in</Link>
              </p>
            </div>
            
          </div>
        </div>
      </main>
      
      {/* Bottom spacing for accessibility */}
      <footer className="py-4 text-center text-[#43474f]/60 text-xs relative z-10 mt-auto">
        © 2024 Serene Anchor. Designed for comfort and clarity.
      </footer>
    </div>
  );
}
