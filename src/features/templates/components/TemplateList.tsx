import React, { useState } from 'react';
import { File, Download, X, ArrowUpDown, ArrowDown, ArrowUp, FileText, FileType2, Lock, Eye } from 'lucide-react';
import type { Template } from '../types';
import { PreviewDialog } from './PreviewDialog';

interface TemplateListProps {
  templates: Template[];
  onEdit: (template: Template) => void;
  onDelete: (id: string) => void;
  onExport: (template: Template) => void;
}

type SortField = 'name' | 'lastModified';
type SortDirection = 'asc' | 'desc';

const formatIcons: Record<string, { icon: React.ElementType; color: string }> = {
  html: { icon: FileText, color: 'text-orange-500' },
  docx: { icon: FileType2, color: 'text-blue-500' },
  pdf: { icon: File, color: 'text-red-500' }
};

export function TemplateList({ templates, onEdit, onDelete, onExport }: TemplateListProps) {
  const [sortField, setSortField] = useState<SortField>('lastModified');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return <ArrowUpDown className="w-4 h-4" />;
    return sortDirection === 'asc' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />;
  };

  const handleTemplateClick = (template: Template) => {
    if (template.imported) {
      setPreviewTemplate(template);
    } else {
      onEdit(template);
    }
  };

  const handleDelete = (e: React.MouseEvent, template: Template) => {
    e.stopPropagation();
    const message = template.imported 
      ? 'Are you sure you want to delete this imported template?' 
      : 'Are you sure you want to delete this template?';
    if (window.confirm(message)) {
      onDelete(template.id);
    }
  };

  const sortedTemplates = [...templates].sort((a, b) => {
    const modifier = sortDirection === 'asc' ? 1 : -1;
    
    if (sortField === 'name') {
      return (a.name || 'Untitled').localeCompare(b.name || 'Untitled') * modifier;
    } else {
      return (new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime()) * modifier;
    }
  });

  return (
    <div className="space-y-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-4">
        <div className="flex gap-4">
          <button
            onClick={() => handleSort('name')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              sortField === 'name'
                ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            Name
            {getSortIcon('name')}
          </button>
          <button
            onClick={() => handleSort('lastModified')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              sortField === 'lastModified'
                ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            Last Modified
            {getSortIcon('lastModified')}
          </button>
        </div>
      </div>

      {sortedTemplates.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl">
          <File className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No templates yet</h3>
          <p className="text-gray-500 dark:text-gray-400">
            Create your first template to get started
          </p>
        </div>
      ) : (
        sortedTemplates.map((template) => {
          const formatIcon = formatIcons[template.format] || formatIcons.html;
          const FormatIcon = formatIcon.icon;
          const formatColor = formatIcon.color;

          return (
            <div
              key={template.id}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 group hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => handleTemplateClick(template)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`${formatColor}`}>
                    <FormatIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                        {template.name || 'Untitled Template'}
                      </h3>
                      <span className="text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
                        .{template.format}
                      </span>
                      {template.imported && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                          <Lock className="w-3 h-3" />
                          Imported
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Last modified: {new Date(template.lastModified).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  {template.imported && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setPreviewTemplate(template);
                      }}
                      className="p-2 text-gray-400 hover:text-indigo-500 dark:text-gray-500 dark:hover:text-indigo-400 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                      title="Preview template"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onExport(template);
                    }}
                    className="p-2 text-gray-400 hover:text-indigo-500 dark:text-gray-500 dark:hover:text-indigo-400 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                    title="Download template"
                  >
                    <Download className="w-5 h-5" />
                  </button>
                  <button
                    onClick={(e) => handleDelete(e, template)}
                    className="p-2 text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                    title="Delete template"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })
      )}

      {previewTemplate && (
        <PreviewDialog
          template={previewTemplate}
          onClose={() => setPreviewTemplate(null)}
        />
      )}
    </div>
  );
}