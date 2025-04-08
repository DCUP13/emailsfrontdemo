import React, { useState, createContext, useContext, useEffect } from 'react';
import { Login } from './components/Login';
import { Register } from './components/Register';
import { Dashboard } from './components/Dashboard';
import { AppPage } from './components/AppPage';
import { Sidebar } from './components/Sidebar';
import { Settings } from './components/Settings';
import { TemplatesPage } from './features/templates/TemplatesPage';
import { Emails } from './components/Emails';
import { Contacts } from './components/Contacts';
import { EmailProvider } from './contexts/EmailContext';
import { supabase } from './lib/supabase';
import type { Template } from './features/templates/types';
import { AlertCircle } from 'lucide-react';

type View = 'login' | 'register' | 'dashboard' | 'app' | 'settings' | 'templates' | 'emails' | 'contacts';

interface ThemeContextType {
  darkMode: boolean;
  toggleDarkMode: () => Promise<void>;
}

export const ThemeContext = createContext<ThemeContextType>({
  darkMode: false,
  toggleDarkMode: async () => {},
});

export const TemplatesContext = createContext<{
  templates: Template[];
  fetchTemplates: () => Promise<void>;
}>({
  templates: [],
  fetchTemplates: async () => {},
});

export default function App() {
  const [view, setView] = useState<View>('login');
  const [darkMode, setDarkMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [supabaseError, setSupabaseError] = useState(false);

  const fetchUserSettings = async () => {
    try {
      const user = await supabase.auth.getUser();
      if (!user.data.user) return;

      const { data, error } = await supabase
        .from('user_settings')
        .select('dark_mode')
        .eq('user_id', user.data.user.id)
        .single();

      if (error) throw error;
      if (data) {
        setDarkMode(data.dark_mode);
      }
    } catch (error) {
      console.error('Error fetching user settings:', error);
    }
  };

  useEffect(() => {
    // Check Supabase connection
    const checkConnection = async () => {
      try {
        const { error } = await supabase.from('profiles').select('count');
        if (error) throw error;
        setSupabaseError(false);
      } catch (error) {
        console.error('Supabase connection error:', error);
        setSupabaseError(true);
      }
    };

    checkConnection();

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setView('dashboard');
        fetchUserSettings();
      }
      setIsLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setView('dashboard');
        fetchUserSettings();
      } else {
        setView('login');
        setDarkMode(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('templates')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) throw error;

      setTemplates(data.map(template => ({
        ...template,
        lastModified: template.updated_at
      })));
    } catch (error) {
      console.error('Error fetching templates:', error);
    }
  };

  useEffect(() => {
    if (view !== 'login' && view !== 'register') {
      fetchTemplates();
    }
  }, [view]);

  const toggleDarkMode = async () => {
    try {
      const user = await supabase.auth.getUser();
      if (!user.data.user) {
        throw new Error('User not authenticated');
      }

      const newDarkMode = !darkMode;

      const { error } = await supabase
        .from('user_settings')
        .update({ 
          dark_mode: newDarkMode,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.data.user.id);

      if (error) throw error;
      setDarkMode(newDarkMode);
    } catch (error) {
      console.error('Error updating dark mode:', error);
      alert('Failed to update dark mode setting. Please try again.');
    }
  };

  const handleLogin = () => {
    setView('dashboard');
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setView('login');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (supabaseError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 max-w-md w-full">
          <div className="flex items-center gap-3 text-red-600 dark:text-red-400 mb-4">
            <AlertCircle className="w-6 h-6" />
            <h1 className="text-xl font-semibold">Connection Error</h1>
          </div>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Unable to connect to the database. Please click the "Connect to Supabase" button in the top right corner to establish a connection.
          </p>
          <div className="flex justify-end">
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              Retry Connection
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ThemeContext.Provider value={{ darkMode, toggleDarkMode }}>
      <TemplatesContext.Provider value={{ templates, fetchTemplates }}>
        <EmailProvider>
          <div className={darkMode ? 'dark' : ''}>
            {view === 'dashboard' || view === 'app' || view === 'settings' || view === 'templates' || view === 'emails' || view === 'contacts' ? (
              <div className="flex min-h-screen bg-white dark:bg-gray-900">
                <div className="fixed inset-y-0 left-0 w-64">
                  <Sidebar 
                    onSignOut={handleSignOut} 
                    onHomeClick={() => setView('dashboard')}
                    onAppClick={() => setView('app')}
                    onSettingsClick={() => setView('settings')}
                    onTemplatesClick={() => setView('templates')}
                    onEmailsClick={() => setView('emails')}
                    onContactsClick={() => setView('contacts')}
                  />
                </div>
                <div className="flex-1 ml-64">
                  {view === 'dashboard' && (
                    <Dashboard onSignOut={handleSignOut} currentView={view} />
                  )}
                  {view === 'app' && (
                    <AppPage onSignOut={handleSignOut} currentView={view} />
                  )}
                  {view === 'settings' && (
                    <Settings onSignOut={handleSignOut} currentView={view} />
                  )}
                  {view === 'templates' && (
                    <TemplatesPage onSignOut={handleSignOut} currentView={view} />
                  )}
                  {view === 'emails' && (
                    <Emails onSignOut={handleSignOut} currentView={view} />
                  )}
                  {view === 'contacts' && (
                    <Contacts onSignOut={handleSignOut} currentView={view} />
                  )}
                </div>
              </div>
            ) : (
              <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 w-full max-w-md">
                  {view === 'login' ? (
                    <Login 
                      onRegisterClick={() => setView('register')}
                      onLoginSuccess={handleLogin}
                    />
                  ) : (
                    <Register onLoginClick={() => setView('login')} />
                  )}
                </div>
              </div>
            )}
          </div>
        </EmailProvider>
      </TemplatesContext.Provider>
    </ThemeContext.Provider>
  );
}