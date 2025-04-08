import React from 'react';
import { FileText, FileType2, File, X } from 'lucide-react';

interface ExportDialogProps {
  onClose: () => void;
  onExport: (format: 'html' | 'docx' | 'pdf') => void;
}

export function ExportDialog({ onClose, onExport }: ExportDialogProps) {
  const exportOptions = [
    {
      format: 'html' as const,
      label: 'HTML',
      description: 'Export as a web page',
      icon: FileText,
      color: 'text-orange-500'
    },
    {
      format: 'docx' as const,
      label: 'DOCX',
      description: 'Export as a Word document',
      icon: FileType2,
      color: 'text-blue-500'
    },
    {
      format: 'pdf' as const,
      label: 'PDF',
      description: 'Export as a PDF document',
      icon: File,
      color: 'text-red-500'
    }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Export Template</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="space-y-2">
          {exportOptions.map(({ format, label, description, icon: Icon, color }) => (
            <button
              key={format}
              onClick={() => onExport(format)}
              className="w-full p-4 text-left bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 hover:border-indigo-500 dark:hover:border-indigo-400 transition-colors group"
            >
              <div className="flex items-center gap-4">
                <div className={`${color} group-hover:text-indigo-500 dark:group-hover:text-indigo-400`}>
                  <Icon className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-indigo-500 dark:group-hover:text-indigo-400">
                    {label}
                  </h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {description}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}