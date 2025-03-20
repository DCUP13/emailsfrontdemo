import React, { useState, useEffect } from 'react';
import { Server, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface RapidAPISettings {
  maxPages: number;
  apiKey: string;
  apiHost: string;
}

export function RapidAPITab() {
  const [settings, setSettings] = useState<RapidAPISettings>({
    maxPages: 10,
    apiKey: '',
    apiHost: ''
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const user = await supabase.auth.getUser();
      if (!user.data.user) {
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('rapid_api_settings')
        .select('*')
        .eq('user_id', user.data.user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setSettings({
          maxPages: data.max_pages,
          apiKey: data.api_key,
          apiHost: data.api_host
        });
      }
    } catch (error) {
      console.error('Error fetching Rapid API settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const user = await supabase.auth.getUser();
      if (!user.data.user) {
        throw new Error('User not authenticated');
      }

      const { error } = await supabase
        .from('rapid_api_settings')
        .upsert({
          user_id: user.data.user.id,
          max_pages: settings.maxPages,
          api_key: settings.apiKey,
          api_host: settings.apiHost,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        });

      if (error) throw error;

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error('Error saving Rapid API settings:', error);
      alert('Failed to save settings. Please try again.');
    } finally {
      setIsSaving(false);
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
        <Server className="w-5 h-5 text-gray-500 dark:text-gray-400" />
        <h2 className="text-lg font-medium text-gray-900 dark:text-white">Rapid API Configuration</h2>
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg p-4 mb-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-500 mt-0.5" />
          <div>
            <h3 className="text-sm font-medium text-blue-800 dark:text-blue-300">
              Zillow API Access Required
            </h3>
            <p className="mt-1 text-sm text-blue-700 dark:text-blue-400">
              To use this feature, you need to sign up for the Zillow API on RapidAPI. Follow these steps:
            </p>
            <ol className="mt-2 ml-4 text-sm text-blue-700 dark:text-blue-400 list-decimal space-y-1">
              <li>Visit <a href="https://rapidapi.com/apimaker/api/zillow-com1" target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-600 dark:hover:text-blue-300">Zillow API on RapidAPI</a></li>
              <li>Subscribe to get your API key</li>
              <li>Navigate to the /findAgentV2 endpoint</li>
              <li>Copy your API key and host from the code examples</li>
              <li>Enter them in the fields below</li>
            </ol>
          </div>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-4">
        <div>
          <label htmlFor="maxPages" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Max Pages to Fetch
          </label>
          <input
            type="number"
            id="maxPages"
            min="1"
            max="100"
            value={settings.maxPages}
            onChange={(e) => setSettings(prev => ({ ...prev, maxPages: parseInt(e.target.value, 10) }))}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            required
          />
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Number of pages to fetch from the API (1-100)
          </p>
        </div>

        <div>
          <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            RapidAPI Key
          </label>
          <input
            type="password"
            id="apiKey"
            value={settings.apiKey}
            onChange={(e) => setSettings(prev => ({ ...prev, apiKey: e.target.value }))}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            placeholder="Enter your RapidAPI key"
            required
          />
        </div>

        <div>
          <label htmlFor="apiHost" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            RapidAPI Host
          </label>
          <input
            type="text"
            id="apiHost"
            value={settings.apiHost}
            onChange={(e) => setSettings(prev => ({ ...prev, apiHost: e.target.value }))}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            placeholder="Enter the RapidAPI host"
            required
          />
        </div>

        <div className="flex items-center justify-end gap-4 pt-4">
          {saveSuccess && (
            <span className="text-sm text-green-600 dark:text-green-400">
              Settings saved successfully!
            </span>
          )}
          <button
            type="submit"
            disabled={isSaving}
            className={`px-4 py-2 rounded-lg text-sm font-medium text-white ${
              isSaving 
                ? 'bg-indigo-400 cursor-wait' 
                : 'bg-indigo-600 hover:bg-indigo-700'
            }`}
          >
            {isSaving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </form>
    </div>
  );
}