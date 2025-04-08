import React, { useState } from 'react';
import { LogIn, UserPlus, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface LoginProps {
  onRegisterClick: () => void;
  onLoginSuccess: () => void;
}

export function Login({ onRegisterClick, onLoginSuccess }: LoginProps) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMessage('');
    
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (error) {
        // Provide more user-friendly error messages
        if (error.message === 'Invalid login credentials') {
          throw new Error('The email or password you entered is incorrect. Please try again.');
        }
        if (error.message.includes('Email not confirmed')) {
          throw new Error('Please check your email to confirm your account before logging in.');
        }
        throw error;
      }

      setStatus('success');
      setTimeout(() => {
        setStatus('idle');
        setFormData({ email: '', password: '' });
        onLoginSuccess();
      }, 1000);
    } catch (error) {
      setStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Failed to sign in');
    }
  };

  return (
    <>
      <div className="flex items-center gap-3 mb-8">
        <LogIn className="w-6 h-6 text-indigo-600" />
        <h1 className="text-2xl font-bold text-gray-800">Login</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {status === 'error' && (
          <div className="flex items-center gap-2 p-4 text-sm text-red-600 bg-red-50 rounded-lg">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p>{errorMessage}</p>
          </div>
        )}

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email Address
          </label>
          <input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="you@example.com"
            required
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="••••••••"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={status === 'loading' || status === 'success'}
          className={`w-full py-2 px-4 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-all ${
            status === 'loading' 
              ? 'bg-indigo-400 cursor-wait' 
              : status === 'success'
              ? 'bg-green-500 cursor-default'
              : 'bg-indigo-600 hover:bg-indigo-700'
          } text-white`}
        >
          {status === 'loading' ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Logging in...
            </>
          ) : status === 'success' ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Welcome Back!
            </>
          ) : (
            <>
              <LogIn className="w-4 h-4" />
              Login
            </>
          )}
        </button>
      </form>

      <div className="mt-6 text-center">
        <button
          onClick={onRegisterClick}
          className="inline-flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-700 font-medium"
        >
          <UserPlus className="w-4 h-4" />
          Create an account
        </button>
      </div>
    </>
  );
}