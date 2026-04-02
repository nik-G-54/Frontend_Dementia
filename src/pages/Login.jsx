import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Phone, Lock, HelpCircle, ArrowRight } from 'lucide-react';

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
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone, pin }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify({ name: data.name, userId: data.userId, age: data.age }));
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



      <main className="flex-grow flex items-center justify-center px-6 py-8 md:py-12 relative z-10 w-full max-w-7xl mx-auto">
        <div className="w-full max-w-4xl grid md:grid-cols-2 bg-white rounded-2xl overflow-hidden mx-auto" style={{ boxShadow: '0 40px 100px -20px rgba(0, 30, 64, 0.12)' }}>
          
          {/* Left Side: Visual Welcome */}
          <div className="hidden md:flex flex-col justify-center items-center p-8 bg-gradient-to-br from-[#001e40] to-[#003366] text-white relative overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <svg className="w-full h-full" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <path d="M0 50 Q 25 25, 50 50 T 100 50" fill="none" stroke="white" strokeWidth="2"></path>
              </svg>
            </div>
            <div className="relative z-10 text-center space-y-4">
              <div className="max-w-[60%] max-h-50 mx-auto bg-white/10 backdrop-blur-md p-2 shadow-inner rounded-2xl flex items-center justify-center overflow-hidden">
                 <img alt="CogGuard Brand" className="w-full h-auto max-h-48 object-contain rounded-xl" src="/WhatsApp%20Image%202026-04-03%20at%2000.22.30.jpeg"/>
              </div>
              <div className="space-y-4">
                <h2 className="font-headline font-extrabold text-4xl tracking-tight">Welcome Back!</h2>
                <p className="font-body text-white/80 text-xl leading-relaxed">
                  Log in to access your daily support, reminders, and gentle guidance.
                </p>
              </div>
            </div>
          </div>
          
          {/* Right Side: Login Form */}
          <div className="p-6 md:p-8 lg:p-10 flex flex-col justify-center">
            <div className="md:hidden text-center mb-6 space-y-1">
              <h1 className="font-headline font-extrabold text-3xl text-[#001e40]">Hello!</h1>
              <p className="text-[#43474f]">Sign in to your account</p>
            </div>
            
            <div className="hidden md:block mb-8">
              <h1 className="font-headline font-extrabold text-3xl text-[#001e40] mb-1">Hello!</h1>
              <p className="text-[#43474f] font-body">Sign in to your account</p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm font-medium p-3 rounded-xl mb-6">
                {error}
              </div>
            )}

            <form className="space-y-6" onSubmit={handleLogin}>
              {/* Phone Field */}
              <div className="space-y-2">
                <label className="block font-headline font-semibold text-[#001e40] text-lg" htmlFor="phone">
                  Phone Number
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                    <Phone className="text-[#737780] group-focus-within:text-[#075fab] transition-colors" size={20} />
                  </div>
                  <input 
                    className="block w-full pl-14 pr-5 py-3 bg-[#e6e8ea] border-2 border-transparent rounded-2xl text-lg font-body focus:bg-white focus:border-[#075fab]/30 focus:outline-none transition-all placeholder:text-[#737780]/60" 
                    id="phone" 
                    name="phone" 
                    placeholder="Enter your number" 
                    type="tel"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    required 
                  />
                </div>
              </div>
              
              {/* PIN Field */}
              <div className="space-y-2">
                <label className="block font-headline font-semibold text-[#001e40] text-lg" htmlFor="pin">
                  4-digit PIN
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                    <Lock className="text-[#737780] group-focus-within:text-[#075fab] transition-colors" size={20} />
                  </div>
                  <input 
                    className="block w-full pl-14 pr-5 py-3 bg-[#e6e8ea] border-2 border-transparent rounded-2xl text-lg font-body focus:bg-white focus:border-[#075fab]/30 focus:outline-none transition-all tracking-[0.5em] placeholder:tracking-normal placeholder:text-[#737780]/60" 
                    id="pin" 
                    inputMode="numeric" 
                    name="pin" 
                    pattern="[0-9]*" 
                    placeholder="••••" 
                    type="password"
                    maxLength={4}
                    value={pin}
                    onChange={e => setPin(e.target.value)}
                    required 
                  />
                </div>
                {/* <div className="flex justify-end pt-1">
                  <a className="text-[#075fab] font-semibold text-sm hover:underline" href="#">
                    Forgot PIN?
                  </a>
                </div> */}
              </div>

              {/* Action Button */}
              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-[#001e40] text-white font-headline font-bold text-lg py-3.5 rounded-2xl shadow-lg hover:bg-[#003366] active:scale-[0.98] transition-all flex items-center justify-center gap-3 mt-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? "Signing in..." : "Sign In"}
                {!loading && <ArrowRight size={24} />}
              </button>
            </form>

            <div className="mt-8 text-center flex flex-col gap-1">
              <p className="font-body text-[#43474f] text-sm">
                Don't have an account?{' '}
                <Link to="/signup" className="text-[#075fab] font-bold hover:underline ml-1">Sign up</Link>
              </p>
              <p className="font-body text-[#43474f] text-sm">
                Need help? 
                <a className="text-[#075fab] font-bold hover:underline ml-1" href="#">Contact Support</a>
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
