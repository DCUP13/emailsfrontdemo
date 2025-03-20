import React from 'react';
import { FileText, FileType2, File } from 'lucide-react';

interface FilePreviewProps {
  format: 'html' | 'docx' | 'pdf';
  content: string;
}

export function FilePreview({ format, content }: FilePreviewProps) {
  const getFormatIcon = () => {
    switch (format) {
      case 'html':
        return <FileText className="w-6 h-6 text-orange-500" />;
      case 'docx':
        return <FileType2 className="w-6 h-6 text-blue-500" />;
      case 'pdf':
        return <File className="w-6 h-6 text-red-500" />;
    }
  };

  const getFormatLabel = () => {
    switch (format) {
      case 'html':
        return 'HTML Document';
      case 'docx':
        return 'Word Document';
      case 'pdf':
        return 'PDF Document';
    }
  };

  const renderContent = () => {
    switch (format) {
      case 'pdf':
        return (
          <div className="space-y-4">
            {content.split('<div class="pdf-page">').map((page, index) => {
              if (!page.trim()) return null;
              const cleanPage = page.replace('</div>', '').trim();
              return (
                <div
                  key={index}
                  className="p-6 bg-white dark:bg-gray-700 rounded-lg shadow-sm"
                >
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                    Page {index + 1}
                  </div>
                  <div className="whitespace-pre-wrap font-mono text-sm text-gray-900 dark:text-gray-100">
                    {cleanPage}
                  </div>
                </div>
              );
            })}
          </div>
        );

      case 'docx':
        try {
          const { preview } = JSON.parse(content);
          return (
            <div className="docx-preview bg-white dark:bg-gray-700 rounded-lg p-8 shadow-sm">
              <div
                className="prose dark:prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: preview }}
              />
            </div>
          );
        } catch {
          return (
            <div className="p-6 bg-white dark:bg-gray-700 rounded-lg shadow-sm">
              <p className="text-gray-500 dark:text-gray-400">
                Preview not available for this DOCX file
              </p>
            </div>
          );
        }

      case 'html':
        return (
          <div className="html-preview bg-white dark:bg-gray-700 rounded-lg p-8 shadow-sm">
            <div
              className="prose dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: content }}
            />
          </div>
        );

      default:
        return <div>Unsupported format</div>;
    }
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          {getFormatIcon()}
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            {getFormatLabel()} Preview
          </h3>
        </div>
      </div>
      
      <div className="p-6">
        {renderContent()}
      </div>
    </div>
  );
}