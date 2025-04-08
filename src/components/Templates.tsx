import React, { useState, useRef } from 'react';
import { File, Plus, Upload as UploadIcon, Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, AlignJustify, List, ListOrdered, Image, Link, Type, X, Save } from 'lucide-react';

interface TemplatesProps {
  onSignOut: () => void;
  currentView: string;
}

export function Templates({ onSignOut, currentView }: TemplatesProps) {
  const [templates, setTemplates] = useState<any[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFormat = (command: string, value?: string) => {
    document.execCommand(command, false, value);
  };

  const handleAddButton = () => {
    if (!editorRef.current) return;
    
    const button = document.createElement('button');
    button.textContent = 'Click Me';
    button.className = 'bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors absolute';
    button.contentEditable = 'false';
    button.draggable = true;
    button.setAttribute('data-url', '#');

    // Position button at center of editor initially
    const editorRect = editorRef.current.getBoundingClientRect();
    button.style.left = `${editorRect.width / 2 - 50}px`;
    button.style.top = `${editorRect.height / 2 - 20}px`;

    // Add drag event listeners
    button.addEventListener('dragstart', (e) => {
      e.dataTransfer.setData('text/plain', '');
      button.classList.add('opacity-50');
    });

    button.addEventListener('drag', (e) => {
      if (e.clientX === 0 && e.clientY === 0) return; // Ignore invalid positions
      
      const editorRect = editorRef.current?.getBoundingClientRect();
      if (!editorRect) return;

      const x = e.clientX - editorRect.left;
      const y = e.clientY - editorRect.top;
      
      button.style.left = `${x}px`;
      button.style.top = `${y}px`;
    });

    button.addEventListener('dragend', (e) => {
      button.classList.remove('opacity-50');
      const editorRect = editorRef.current?.getBoundingClientRect();
      if (!editorRect) return;

      const x = e.clientX - editorRect.left;
      const y = e.clientY - editorRect.top;

      // Constrain to editor bounds
      const maxX = editorRect.width - button.offsetWidth;
      const maxY = editorRect.height - button.offsetHeight;
      
      button.style.left = `${Math.max(0, Math.min(x, maxX))}px`;
      button.style.top = `${Math.max(0, Math.min(y, maxY))}px`;
    });

    // Add click handler for editing text
    button.addEventListener('click', (e) => {
      e.preventDefault();
      if (e.target === button) {
        button.contentEditable = 'true';
        button.focus();
      }
    });

    // Add blur handler to disable editing
    button.addEventListener('blur', () => {
      button.contentEditable = 'false';
    });

    // Add context menu for URL
    button.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      const currentUrl = button.getAttribute('data-url') || '#';
      const newUrl = prompt('Enter button URL:', currentUrl);
      if (newUrl !== null) {
        button.setAttribute('data-url', newUrl);
      }
    });

    editorRef.current.appendChild(button);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && editorRef.current) {
      const reader = new FileReader();
      reader.onload = () => {
        const img = document.createElement('img');
        img.src = reader.result as string;
        img.className = 'max-w-full h-auto rounded-lg shadow-sm absolute';
        img.draggable = true;

        // Position image at center initially
        const editorRect = editorRef.current.getBoundingClientRect();
        img.style.left = `${editorRect.width / 2 - 150}px`;
        img.style.top = `${editorRect.height / 2 - 100}px`;

        // Add drag event listeners
        img.addEventListener('dragstart', (e) => {
          e.dataTransfer.setData('text/plain', '');
          img.classList.add('opacity-50');
        });

        img.addEventListener('drag', (e) => {
          if (e.clientX === 0 && e.clientY === 0) return;
          
          const editorRect = editorRef.current?.getBoundingClientRect();
          if (!editorRect) return;

          const x = e.clientX - editorRect.left;
          const y = e.clientY - editorRect.top;
          
          img.style.left = `${x}px`;
          img.style.top = `${y}px`;
        });

        img.addEventListener('dragend', (e) => {
          img.classList.remove('opacity-50');
          const editorRect = editorRef.current?.getBoundingClientRect();
          if (!editorRect) return;

          const x = e.clientX - editorRect.left;
          const y = e.clientY - editorRect.top;

          // Constrain to editor bounds
          const maxX = editorRect.width - img.offsetWidth;
          const maxY = editorRect.height - img.offsetHeight;
          
          img.style.left = `${Math.max(0, Math.min(x, maxX))}px`;
          img.style.top = `${Math.max(0, Math.min(y, maxY))}px`;
        });

        editorRef.current.appendChild(img);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  return (
    <div className="h-screen flex flex-col bg-white dark:bg-gray-900">
      {isEditing ? (
        <div className="flex flex-col h-full">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <input
                type="text"
                placeholder="Template Name"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                className="text-xl font-semibold bg-transparent border-none focus:ring-0 text-gray-900 dark:text-white"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg"
                >
                  <X className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    // Save template logic here
                    setIsEditing(false);
                  }}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Template
                </button>
              </div>
            </div>

            <div className="flex items-center gap-1 p-2">
              <button
                onClick={() => handleFormat('bold')}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                title="Bold"
              >
                <Bold className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleFormat('italic')}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                title="Italic"
              >
                <Italic className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleFormat('underline')}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                title="Underline"
              >
                <Underline className="w-4 h-4" />
              </button>

              <div className="h-6 w-px bg-gray-200 dark:bg-gray-700 mx-1" />

              <button
                onClick={() => handleFormat('justifyLeft')}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                title="Align Left"
              >
                <AlignLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleFormat('justifyCenter')}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                title="Align Center"
              >
                <AlignCenter className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleFormat('justifyRight')}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                title="Align Right"
              >
                <AlignRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleFormat('justifyFull')}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                title="Justify"
              >
                <AlignJustify className="w-4 h-4" />
              </button>

              <div className="h-6 w-px bg-gray-200 dark:bg-gray-700 mx-1" />

              <button
                onClick={() => handleFormat('insertUnorderedList')}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                title="Bullet List"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleFormat('insertOrderedList')}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                title="Numbered List"
              >
                <ListOrdered className="w-4 h-4" />
              </button>

              <div className="h-6 w-px bg-gray-200 dark:bg-gray-700 mx-1" />

              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                title="Insert Image"
              >
                <Image className="w-4 h-4" />
              </button>
              <button
                onClick={handleAddButton}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                title="Insert Button"
              >
                <Link className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleFormat('formatBlock', '<h2>')}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                title="Add Heading"
              >
                <Type className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div
            ref={editorRef}
            className="flex-1 p-6 relative min-h-[500px] bg-gray-50 dark:bg-gray-800"
            contentEditable
            suppressContentEditableWarning
            onDragOver={handleDragOver}
          />
        </div>
      ) : (
        <div className="p-8">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <File className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Templates</h1>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setIsEditing(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Template
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {templates.map((template) => (
                <div
                  key={template.id}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6"
                >
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    {template.name}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Last modified: {template.lastModified}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImageUpload}
        accept="image/*"
        className="hidden"
      />
    </div>
  );
}