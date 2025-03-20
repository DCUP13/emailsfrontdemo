import React from 'react';
import { Toggle } from './Toggle';
import type { SettingRowProps } from './types';

export function SettingRow({ 
  icon: Icon, 
  title, 
  description, 
  setting, 
  checked,
  onChange 
}: SettingRowProps) {
  return (
    <div className="flex items-center justify-between py-4">
      <div className="flex gap-4">
        <div className="mt-1">
          <Icon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-900 dark:text-white">{title}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
        </div>
      </div>
      <Toggle
        checked={checked}
        onChange={onChange}
      />
    </div>
  );
}