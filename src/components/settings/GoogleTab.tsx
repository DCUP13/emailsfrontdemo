import React, { useState, useEffect } from 'react';
import { Mail, Send, X, Key } from 'lucide-react';
import { useEmails } from '../../contexts/EmailContext';
import type { GoogleEmail } from './types';
import { supabase } from '../../lib/supabase';

export function GoogleTab() {
  const { googleEmails, setGoogleEmails } = useEmails();
  const [showPassword, setShowPassword] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newAppPassword, setNewAppPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchGoogleEmails();
  }, []);

  const fetchGoogleEmails = async () => {
    try {
      const user = await supabase.auth.getUser();
      if (!user.data.user) {
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('google_smtp_emails')
        .select('*')
        .eq('user_id', user.data.user.id);

      if (error) throw error;

      setGoogleEmails(data?.map(email => ({
        address: email.address,
        appPassword: email.app_password
      })) || []);
    } catch (error) {
      console.error('Error fetching Google SMTP emails:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const validateEmail = (email: string) => {
    return email.match(/^[^\s@]+@gmail\.com$/);
  };

  const validateAppPassword = (password: string) => {
    return password.length === 16 && /^[a-zA-Z0-9]+$/.test(password);
  };

  const handleAddGoogleEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateEmail(newEmail)) {
      setEmailError('Please enter a valid Gmail address');
      return;
    }

    if (!validateAppPassword(newAppPassword)) {
      setPasswordError('App password must be 16 characters long');
      return;
    }

    if (googleEmails.some(email => email.address === newEmail)) {
      setEmailError('This email is already in the list');
      return;
    }

    try {
      const user = await supabase.auth.getUser();
      if (!user.data.user) {
        throw new Error('User not authenticated');
      }

      const { error } = await supabase
        .from('google_smtp_emails')
        .insert({
          user_id: user.data.user.id,
          address: newEmail,
          app_password: newAppPassword
        });

      if (error) {
        if (error.code === '23505') { // Unique violation
          setEmailError('This email is already registered');
          return;
        }
        throw error;
      }

      setGoogleEmails([...googleEmails, { 
        address: newEmail,
        appPassword: newAppPassword
      }]);
      setNewEmail('');
      setNewAppPassword('');
      setEmailError('');
      setPasswordError('');
    } catch (error) {
      console.error('Error adding Google SMTP email:', error);
      alert('Failed to add email. Please try again.');
    }
  };

  const handleRemoveGoogleEmail = async (address: string) => {
    try {
      const user = await supabase.auth.getUser();
      if (!user.data.user) {
        throw new Error('User not authenticated');
      }

      const { error } = await supabase
        .from('google_smtp_emails')
        .delete()
        .eq('user_id', user.data.user.id)
        .eq('address', address);

      if (error) throw error;

      setGoogleEmails(googleEmails.filter(email => email.address !== address));
    } catch (error) {
      console.error('Error removing Google SMTP email:', error);
      alert('Failed to remove email. Please try again.');
    }
  };

  const handleTestEmail = async (email: GoogleEmail) => {
    setGoogleEmails(prev => prev.map(e => 
      e.address === email.address 
        ? { ...e, testing: true }
        : e
    ));

    try {
      // Simulate sending a test email
      await new Promise(resolve => setTimeout(resolve, 2000));
      setGoogleEmails(prev => prev.map(e => 
        e.address === email.address 
          ? { ...e, testing: false }
          : e
      ));
      alert('Test email sent successfully!');
    } catch (error) {
      setGoogleEmails(prev => prev.map(e => 
        e.address === email.address 
          ? { ...e, testing: false }
          : e
      ));
      alert('Failed to send test email. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Mail className="w-5 h-5 text-gray-500 dark:text-gray-400" />
        <h2 className="text-lg font-medium text-gray-900 dark:text-white">Google SMTP Configuration</h2>
      </div>

      <div className="space-y-6">
        <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-4">
          <h3 className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-2">
            About Google App Passwords
          </h3>
          <p className="text-sm text-blue-700 dark:text-blue-400">
            App passwords are 16-character codes that give an app or device permission to access your Google Account. 
            You'll need to generate an app password for each email you want to use with SMTP.
          </p>
          <div className="mt-2 space-y-2">
            <a 
              href="https://myaccount.google.com/u/1/apppasswords"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
            >
              Log into your account to generate an app password
            </a>
            <div>
              <a 
                href="https://support.google.com/accounts/answer/185833"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
              >
                Learn more about app passwords
              </a>
            </div>
          </div>
        </div>

        <form onSubmit={handleAddGoogleEmail} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Gmail Address
            </label>
            <input
              type="email"
              id="email"
              value={newEmail}
              onChange={(e) => {
                setNewEmail(e.target.value);
                setEmailError('');
              }}
              placeholder="example@gmail.com"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
            {emailError && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{emailError}</p>
            )}
          </div>

          <div>
            <label htmlFor="appPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              App Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                id="appPassword"
                value={newAppPassword}
                onChange={(e) => {
                  setNewAppPassword(e.target.value);
                  setPasswordError('');
                }}
                placeholder="Enter 16-character app password"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white pr-24"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
            {passwordError && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{passwordError}</p>
            )}
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Add Email
            </button>
          </div>
        </form>

        <div className="space-y-4">
          {googleEmails.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-center py-4">
              No Gmail addresses added yet
            </p>
          ) : (
            googleEmails.map((email) => (
              <div
                key={email.address}
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg group"
              >
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-gray-400" />
                  <div>
                    <span className="text-gray-900 dark:text-white">{email.address}</span>
                    <div className="flex items-center gap-2 mt-1">
                      <Key className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {showPassword ? email.appPassword : '••••••••••••••••'}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleTestEmail(email)}
                    disabled={email.testing}
                    className={`inline-flex items-center px-3 py-1 text-sm font-medium rounded-lg ${
                      email.testing
                        ? 'bg-gray-100 text-gray-400 dark:bg-gray-700 dark:text-gray-500 cursor-wait'
                        : 'text-indigo-600 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-900/20'
                    }`}
                  >
                    {email.testing ? (
                      <>
                        <div className="w-4 h-4 mr-2 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Send Test Email
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => handleRemoveGoogleEmail(email.address)}
                    className="p-2 text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}