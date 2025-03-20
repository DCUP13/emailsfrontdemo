import React, { useState, useEffect } from 'react';
import { Server, Mail } from 'lucide-react';
import { GeneralTab } from './settings/GeneralTab';
import { AmazonTab } from './settings/AmazonTab';
import { GoogleTab } from './settings/GoogleTab';
import { RapidAPITab } from './settings/RapidAPITab';
import type { EmailSettings, GeneralSettings } from './settings/types';
import { supabase } from '../lib/supabase';

interface SettingsProps {
  onSignOut: () => void;
  currentView: string;
}

type SettingsTab = 'general' | 'amazon' | 'google' | 'rapid-api';

export function Settings({ onSignOut, currentView }: SettingsProps) {
  const [activeTab, setActiveTab] = useState<SettingsTab>('general');
  const [settings, setSettings] = useState<GeneralSettings>({
    notifications: true,
    twoFactorAuth: false,
    newsletter: false,
    publicProfile: true
  });
  const [isLoading, setIsLoading] = useState(true);

  const [emailSettings, setEmailSettings] = useState<EmailSettings>({
    smtpUsername: '',
    smtpPassword: '',
    smtpPort: '587',
    smtpServer: 'email-smtp.us-east-1.amazonaws.com',
  });

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const createDefaultSettings = async () => {
    try {
      const user = await supabase.auth.getUser();
      if (!user.data.user) return;

      const { error } = await supabase
        .from('user_settings')
        .insert({
          user_id: user.data.user.id,
          notifications: true,
          two_factor_auth: false,
          newsletter: false,
          public_profile: true
        });

      if (error) throw error;
      await fetchSettings();
    } catch (error) {
      console.error('Error creating default settings:', error);
    }
  };

  const fetchSettings = async () => {
    try {
      const user = await supabase.auth.getUser();
      if (!user.data.user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.data.user.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setSettings({
          notifications: data.notifications,
          twoFactorAuth: data.two_factor_auth,
          newsletter: data.newsletter,
          publicProfile: data.public_profile
        });
      } else {
        await createDefaultSettings();
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggle = async (setting: keyof GeneralSettings) => {
    try {
      const user = await supabase.auth.getUser();
      if (!user.data.user) {
        throw new Error('User not authenticated');
      }

      const newSettings = {
        ...settings,
        [setting]: !settings[setting]
      };

      const dbSettings = {
        notifications: newSettings.notifications,
        two_factor_auth: newSettings.twoFactorAuth,
        newsletter: newSettings.newsletter,
        public_profile: newSettings.publicProfile,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('user_settings')
        .update(dbSettings)
        .eq('user_id', user.data.user.id);

      if (error) throw error;

      setSettings(newSettings);
    } catch (error) {
      console.error('Error updating settings:', error);
      alert('Failed to update settings. Please try again.');
    }
  };

  const handleEmailSettingChange = (key: keyof EmailSettings, value: string) => {
    setEmailSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSaveEmailSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      alert('Failed to save email settings. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const tabs = [
    { id: 'general', label: 'General', icon: Server },
    { id: 'amazon', label: 'Amazon SES', icon: Server },
    { id: 'google', label: 'Google SMTP', icon: Mail },
    { id: 'rapid-api', label: 'Rapid API', icon: Server }
  ];

  if (isLoading) {
    return (
      <div className="p-8 bg-gray-50 dark:bg-gray-900 min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Settings</h1>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as SettingsTab)}
                  className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 ${
                    activeTab === tab.id
                      ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'general' && (
              <GeneralTab
                settings={settings}
                onToggle={handleToggle}
              />
            )}

            {activeTab === 'amazon' && (
              <AmazonTab
                emailSettings={emailSettings}
                onEmailSettingChange={handleEmailSettingChange}
                onSaveEmailSettings={handleSaveEmailSettings}
                isSaving={isSaving}
                saveSuccess={saveSuccess}
              />
            )}

            {activeTab === 'google' && <GoogleTab />}

            {activeTab === 'rapid-api' && <RapidAPITab />}
          </div>
        </div>

        <div className="mt-6 text-sm text-gray-500 dark:text-gray-400 text-center">
          Settings are automatically saved when you toggle them
        </div>
      </div>
    </div>
  );
}