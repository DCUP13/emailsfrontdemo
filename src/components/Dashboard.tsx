import React from 'react';

interface DashboardProps {
  onSignOut: () => void;
  currentView: string;
}

export function Dashboard({ onSignOut, currentView }: DashboardProps) {
  return (
    <div className="p-8 bg-white dark:bg-gray-900">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Welcome back!</h1>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Getting Started</h2>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor 
            incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis 
            nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
          </p>
          
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-indigo-50 dark:bg-indigo-900/50 rounded-lg">
              <h3 className="font-medium text-indigo-900 dark:text-indigo-200 mb-2">Quick Start Guide</h3>
              <p className="text-sm text-indigo-800 dark:text-indigo-300">
                Get up and running with our platform in minutes with our easy-to-follow guide.
              </p>
            </div>
            
            <div className="p-4 bg-green-50 dark:bg-green-900/50 rounded-lg">
              <h3 className="font-medium text-green-900 dark:text-green-200 mb-2">Resources</h3>
              <p className="text-sm text-green-800 dark:text-green-300">
                Access documentation, tutorials, and best practices to make the most of our platform.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}