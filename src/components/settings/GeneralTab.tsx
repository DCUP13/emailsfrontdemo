import React, { useContext } from 'react';
import { Bell, Moon, Globe, Lock, Mail } from 'lucide-react';
import { ThemeContext } from '../../App';
import { SettingRow } from './SettingRow';
import type { GeneralSettings } from './types';

interface GeneralTabProps {
  settings: GeneralSettings;
  onToggle: (setting: keyof GeneralSettings) => void;
}

export function GeneralTab({ settings, onToggle }: GeneralTabProps) {
  const { darkMode, toggleDarkMode } = useContext(ThemeContext);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Preferences</h2>
        <div className="space-y-2">
          <SettingRow
            icon={Bell}
            title="Push Notifications"
            description="Receive notifications about important updates and activity"
            setting="notifications"
            checked={settings.notifications}
            onChange={() => onToggle('notifications')}
          />
          <SettingRow
            icon={Moon}
            title="Dark Mode"
            description="Enable dark mode for a better viewing experience at night"
            setting="darkMode"
            checked={darkMode}
            onChange={toggleDarkMode}
          />
        </div>
      </div>

      <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Privacy & Security</h2>
        <div className="space-y-2">
          <SettingRow
            icon={Lock}
            title="Two-Factor Authentication"
            description="Add an extra layer of security to your account"
            setting="twoFactorAuth"
            checked={settings.twoFactorAuth}
            onChange={() => onToggle('twoFactorAuth')}
          />
          <SettingRow
            icon={Globe}
            title="Public Profile"
            description="Make your profile visible to other users"
            setting="publicProfile"
            checked={settings.publicProfile}
            onChange={() => onToggle('publicProfile')}
          />
        </div>
      </div>

      <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Email Preferences</h2>
        <div className="space-y-2">
          <SettingRow
            icon={Mail}
            title="Newsletter"
            description="Receive our newsletter with updates and featured content"
            setting="newsletter"
            checked={settings.newsletter}
            onChange={() => onToggle('newsletter')}
          />
        </div>
      </div>
    </div>
  );
}