import React from 'react';
import { Home, Layout, Settings as SettingsIcon, LogOut, FileText, Mail, Users } from 'lucide-react';

interface SidebarProps {
  onSignOut: () => void;
  onHomeClick: () => void;
  onAppClick: () => void;
  onTemplatesClick: () => void;
  onSettingsClick: () => void;
  onEmailsClick: () => void;
  onContactsClick: () => void;
}

export function Sidebar({ 
  onSignOut, 
  onHomeClick, 
  onAppClick, 
  onSettingsClick, 
  onTemplatesClick, 
  onEmailsClick,
  onContactsClick 
}: SidebarProps) {
  return (
    <div className="h-screen w-64 bg-indigo-800 dark:bg-gray-800 text-white p-6">
      <div className="mb-8">
        <h2 className="text-xl font-bold">Dashboard</h2>
      </div>
      
      <nav className="space-y-2">
        <button 
          onClick={onHomeClick}
          className="w-full flex items-center gap-3 px-4 py-2 text-sm rounded-lg hover:bg-indigo-700 dark:hover:bg-gray-700 transition-colors"
        >
          <Home className="w-4 h-4" />
          Home
        </button>
        
        <button 
          onClick={onAppClick}
          className="w-full flex items-center gap-3 px-4 py-2 text-sm rounded-lg hover:bg-indigo-700 dark:hover:bg-gray-700 transition-colors"
        >
          <Layout className="w-4 h-4" />
          Campaigns
        </button>
        
        <button 
          onClick={onTemplatesClick}
          className="w-full flex items-center gap-3 px-4 py-2 text-sm rounded-lg hover:bg-indigo-700 dark:hover:bg-gray-700 transition-colors"
        >
          <FileText className="w-4 h-4" />
          Templates
        </button>

        <button 
          onClick={onEmailsClick}
          className="w-full flex items-center gap-3 px-4 py-2 text-sm rounded-lg hover:bg-indigo-700 dark:hover:bg-gray-700 transition-colors"
        >
          <Mail className="w-4 h-4" />
          Emails
        </button>

        <button 
          onClick={onContactsClick}
          className="w-full flex items-center gap-3 px-4 py-2 text-sm rounded-lg hover:bg-indigo-700 dark:hover:bg-gray-700 transition-colors"
        >
          <Users className="w-4 h-4" />
          Contacts
        </button>
        
        <button 
          onClick={onSettingsClick}
          className="w-full flex items-center gap-3 px-4 py-2 text-sm rounded-lg hover:bg-indigo-700 dark:hover:bg-gray-700 transition-colors"
        >
          <SettingsIcon className="w-4 h-4" />
          Settings
        </button>
        
        <button 
          onClick={onSignOut}
          className="w-full flex items-center gap-3 px-4 py-2 text-sm rounded-lg hover:bg-indigo-700 dark:hover:bg-gray-700 transition-colors text-red-300 hover:text-red-200"
        >
          <LogOut className="w-4 h-4" />
          Sign out
        </button>
      </nav>
    </div>
  );
}