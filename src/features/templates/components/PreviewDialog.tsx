import React from 'react';
import { X } from 'lucide-react';
import { FilePreview } from './FilePreview';
import type { Template } from '../types';

interface PreviewDialogProps {
  template: Template;
  onClose: () => void;
}

export function PreviewDialog({ template, onClose }: PreviewDialogProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg w-full max-w-4xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            {template.name}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="flex-1 overflow-auto p-6">
          <FilePreview format={template.format} content={template.content} />
        </div>
      </div>
    </div>
  );
}