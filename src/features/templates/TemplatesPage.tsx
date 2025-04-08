import React, { useState, useRef, useEffect } from 'react';
import { File, Plus, Upload as UploadIcon } from 'lucide-react';
import { TemplateList } from './components/TemplateList';
import { TemplateEditor } from './components/TemplateEditor';
import type { Template } from './types';
import { exportAsHTML, exportAsPDF, exportAsDOCX } from './utils/exportUtils';
import { createTemplateFromFile } from './utils/importUtils';
import { supabase } from '../../lib/supabase';

interface TemplatesPageProps {
  onSignOut: () => void;
  currentView: string;
}

export function TemplatesPage({ onSignOut, currentView }: TemplatesPageProps) {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [currentTemplate, setCurrentTemplate] = useState<Template | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const templateFileRef = useRef<HTMLInputElement>(null);

  // Fetch templates when component mounts
  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const { data: templates, error } = await supabase
        .from('templates')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) throw error;

      setTemplates(templates.map(template => ({
        ...template,
        lastModified: template.updated_at
      })));
    } catch (error) {
      console.error('Error fetching templates:', error);
      alert('Failed to load templates. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTemplate = () => {
    const newTemplate: Template = {
      id: '',  // Will be set by Supabase
      name: 'Untitled Template',
      content: '',
      lastModified: new Date().toISOString(),
      format: 'html'
    };
    setCurrentTemplate(newTemplate);
  };

  const handleSaveTemplate = async (template: Template) => {
    try {
      const user = await supabase.auth.getUser();
      if (!user.data.user) {
        throw new Error('User not authenticated');
      }

      const templateData = {
        name: template.name,
        content: template.content,
        format: template.format,
        imported: template.imported || false,
        user_id: user.data.user.id,
        updated_at: new Date().toISOString()
      };

      let result;
      if (template.id) {
        // Update existing template
        result = await supabase
          .from('templates')
          .update(templateData)
          .eq('id', template.id)
          .select()
          .single();
      } else {
        // Create new template
        result = await supabase
          .from('templates')
          .insert(templateData)
          .select()
          .single();
      }

      if (result.error) throw result.error;

      await fetchTemplates();
      setCurrentTemplate(null);
    } catch (error) {
      console.error('Error saving template:', error);
      alert('Failed to save template. Please try again.');
    }
  };

  const handleDeleteTemplate = async (id: string) => {
    try {
      const { error } = await supabase
        .from('templates')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await fetchTemplates();
    } catch (error) {
      console.error('Error deleting template:', error);
      alert('Failed to delete template. Please try again.');
    }
  };

  const handleImportTemplate = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const user = await supabase.auth.getUser();
      if (!user.data.user) {
        throw new Error('User not authenticated');
      }

      if (file.type === 'application/json') {
        // Handle JSON template files
        const reader = new FileReader();
        reader.onload = async (event) => {
          try {
            const template = JSON.parse(event.target?.result as string);
            if (template.name && template.content) {
              const templateData = {
                name: template.name,
                content: template.content,
                format: template.format || 'html',
                imported: true,
                user_id: user.data.user.id
              };

              const { error } = await supabase
                .from('templates')
                .insert(templateData);

              if (error) throw error;
              await fetchTemplates();
            } else {
              throw new Error('Invalid template format');
            }
          } catch (error) {
            alert('Failed to import template. Please check the file format.');
          }
        };
        reader.readAsText(file);
      } else {
        // Handle HTML, DOCX, and PDF files
        const newTemplate = await createTemplateFromFile(file);
        const templateData = {
          name: newTemplate.name,
          content: newTemplate.content,
          format: newTemplate.format,
          imported: true,
          user_id: user.data.user.id
        };

        const { error } = await supabase
          .from('templates')
          .insert(templateData);

        if (error) throw error;
        await fetchTemplates();
      }
    } catch (error) {
      console.error('Import error:', error);
      alert(error instanceof Error ? error.message : 'Failed to import template');
    } finally {
      e.target.value = ''; // Reset input
    }
  };

  const handleExportTemplate = async (template: Template) => {
    try {
      switch (template.format) {
        case 'html':
          exportAsHTML(template.content, template.name);
          break;
        case 'pdf':
          await exportAsPDF(template.content, template.name);
          break;
        case 'docx':
          await exportAsDOCX(template.content, template.name);
          break;
      }
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export template. Please try again.');
    }
  };

  const handleEditTemplate = (template: Template) => {
    if (template.imported) {
      alert('Imported templates cannot be edited. You can create a copy instead.');
      return;
    }
    setCurrentTemplate(template);
  };

  if (isLoading) {
    return (
      <div className="p-8 bg-white dark:bg-gray-900 min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-8 bg-white dark:bg-gray-900 min-h-screen">
      <div className="max-w-4xl mx-auto">
        {!currentTemplate && (
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <File className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Templates</h1>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => templateFileRef.current?.click()}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <UploadIcon className="w-4 h-4 mr-2" />
                Import
              </button>
              <button
                onClick={handleCreateTemplate}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Template
              </button>
            </div>
          </div>
        )}

        {currentTemplate ? (
          <TemplateEditor
            template={currentTemplate}
            onSave={handleSaveTemplate}
            onCancel={() => setCurrentTemplate(null)}
          />
        ) : (
          <TemplateList
            templates={templates}
            onEdit={handleEditTemplate}
            onDelete={handleDeleteTemplate}
            onExport={handleExportTemplate}
          />
        )}
      </div>

      <input
        type="file"
        ref={templateFileRef}
        onChange={handleImportTemplate}
        accept=".json,.html,.docx,.pdf"
        className="hidden"
      />
    </div>
  );
}