import React, { forwardRef, useImperativeHandle, useRef, useEffect } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

export interface QuillEditorRef {
  getContent: () => string;
}

interface QuillEditorProps {
  content: string;
  className?: string;
}

export const QuillEditor = forwardRef<QuillEditorRef, QuillEditorProps>(
  ({ content, className = '' }, ref) => {
    const editorRef = useRef<HTMLDivElement>(null);
    const quillInstanceRef = useRef<ReactQuill>(null);

    useImperativeHandle(ref, () => ({
      getContent: () => quillInstanceRef.current?.getEditor().root.innerHTML || ''
    }));

    const handleChange = (content: string) => {
      const quill = quillInstanceRef.current?.getEditor();
      if (!quill) return;

      // Process images after they're inserted
      const images = quill.container.querySelectorAll('img');
      images.forEach(img => {
        if (!img.style.width) {
          const maxWidth = 300;
          const aspectRatio = img.naturalWidth / img.naturalHeight;
          const width = Math.min(maxWidth, img.naturalWidth);
          const height = width / aspectRatio;
          
          img.style.width = `${width}px`;
          img.style.height = `${height}px`;
          img.style.float = 'left';
          img.style.marginRight = '12px';
          img.style.marginBottom = '12px';
        }
      });
    };

    const modules = {
      toolbar: [
        [{ 'header': [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        [{ 'align': [] }],
        ['link', 'image'],
        ['clean']
      ],
      clipboard: {
        matchVisual: false
      }
    };

    const formats = [
      'header',
      'bold', 'italic', 'underline', 'strike',
      'list', 'bullet',
      'align',
      'link', 'image'
    ];

    useEffect(() => {
      if (!editorRef.current) return;

      const resizeObserver = new ResizeObserver(() => {
        if (quillInstanceRef.current) {
          const editor = quillInstanceRef.current.getEditor();
          editor.update();
        }
      });

      resizeObserver.observe(editorRef.current);

      return () => {
        resizeObserver.disconnect();
      };
    }, []);

    return (
      <div ref={editorRef} className="quill-wrapper">
        <ReactQuill
          ref={quillInstanceRef}
          theme="snow"
          value={content}
          onChange={handleChange}
          modules={modules}
          formats={formats}
          className={className}
          preserveWhitespace
        />
      </div>
    );
  }
);

QuillEditor.displayName = 'QuillEditor';