import React from 'react';
import {
  Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, AlignJustify,
  List, ListOrdered, Image, Link, Type
} from 'lucide-react';

interface TemplateToolbarProps {
  onImageUpload: () => void;
  onAddButton: () => void;
  editorRef: React.RefObject<HTMLDivElement>;
}

export function TemplateToolbar({ onImageUpload, onAddButton, editorRef }: TemplateToolbarProps) {
  const handleFormat = (command: string, value?: string) => {
    document.execCommand(command, false, value);
  };

  return (
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
        onClick={onImageUpload}
        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
        title="Insert Image"
      >
        <Image className="w-4 h-4" />
      </button>
      <button
        onClick={onAddButton}
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
  );
}