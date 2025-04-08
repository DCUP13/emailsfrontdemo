import React, { useEffect } from 'react';

interface DraggableEditorProps {
  className?: string;
  children?: React.ReactNode;
}

export const DraggableEditor = React.forwardRef<HTMLDivElement, DraggableEditorProps>(
  ({ className = '', children }, ref) => {
    useEffect(() => {
      const editor = (ref as React.RefObject<HTMLDivElement>).current;
      if (!editor) return;

      let isDragging = false;
      let isResizing = false;
      let currentHandle = '';
      let startX = 0;
      let startY = 0;
      let startWidth = 0;
      let startHeight = 0;
      let startLeft = 0;
      let startTop = 0;
      let activeElement: HTMLElement | null = null;

      // Make wrapper and its contents uneditable
      const makeWrapperUneditable = (wrapper: HTMLElement) => {
        wrapper.setAttribute('contenteditable', 'false');
        wrapper.style.userSelect = 'none';
        wrapper.style.pointerEvents = 'all';
        const img = wrapper.querySelector('img');
        if (img) {
          img.setAttribute('contenteditable', 'false');
          img.draggable = false;
          img.style.pointerEvents = 'none';
        }
      };

      const handleMouseDown = (e: MouseEvent) => {
        const target = e.target as HTMLElement;
        const wrapper = target.closest('.image-wrapper');
        
        // If not clicking on an image wrapper or resize handle, allow normal text editing
        if (!wrapper && !target.classList.contains('resize-handle')) {
          return;
        }
        
        // Handle resize start
        if (target.classList.contains('resize-handle')) {
          e.preventDefault();
          e.stopPropagation();
          
          isResizing = true;
          currentHandle = target.className.split(' ')[1].replace('resize-handle-', '');
          activeElement = wrapper;
          
          startX = e.clientX;
          startY = e.clientY;
          startWidth = wrapper.offsetWidth;
          startHeight = wrapper.offsetHeight;
          startLeft = wrapper.offsetLeft;
          startTop = wrapper.offsetTop;
          return;
        }

        // Handle drag start
        if (wrapper) {
          e.preventDefault();
          e.stopPropagation();
          
          activeElement = wrapper;
          isDragging = true;
          
          const rect = wrapper.getBoundingClientRect();
          startX = e.clientX - rect.left;
          startY = e.clientY - rect.top;
          startLeft = wrapper.offsetLeft;
          startTop = wrapper.offsetTop;
          
          wrapper.style.zIndex = '1000';
          wrapper.classList.add('opacity-50');
        }
      };

      const handleMouseMove = (e: MouseEvent) => {
        if (!activeElement) return;

        if (isResizing) {
          e.preventDefault();
          const deltaX = e.clientX - startX;
          const deltaY = e.clientY - startY;

          let newWidth = startWidth;
          let newHeight = startHeight;
          let newLeft = startLeft;
          let newTop = startTop;

          // Handle edge resizing
          if (currentHandle === 'e') {
            newWidth = Math.max(100, startWidth + deltaX);
          } else if (currentHandle === 'w') {
            const width = Math.max(100, startWidth - deltaX);
            newLeft = startLeft + (startWidth - width);
            newWidth = width;
          } else if (currentHandle === 's') {
            newHeight = Math.max(50, startHeight + deltaY);
          } else if (currentHandle === 'n') {
            const height = Math.max(50, startHeight - deltaY);
            newTop = startTop + (startHeight - height);
            newHeight = height;
          } else {
            // Handle corner resizing
            if (currentHandle === 'se') {
              newWidth = Math.max(100, startWidth + deltaX);
              newHeight = Math.max(50, startHeight + deltaY);
            } else if (currentHandle === 'sw') {
              const width = Math.max(100, startWidth - deltaX);
              newLeft = startLeft + (startWidth - width);
              newWidth = width;
              newHeight = Math.max(50, startHeight + deltaY);
            } else if (currentHandle === 'ne') {
              newWidth = Math.max(100, startWidth + deltaX);
              const height = Math.max(50, startHeight - deltaY);
              newTop = startTop + (startHeight - height);
              newHeight = height;
            } else if (currentHandle === 'nw') {
              const width = Math.max(100, startWidth - deltaX);
              const height = Math.max(50, startHeight - deltaY);
              newLeft = startLeft + (startWidth - width);
              newTop = startTop + (startHeight - height);
              newWidth = width;
              newHeight = height;
            }
          }

          // Ensure the element stays within editor bounds
          const editorRect = editor.getBoundingClientRect();
          if (newLeft < 0) {
            newWidth += newLeft;
            newLeft = 0;
          }
          if (newTop < 0) {
            newHeight += newTop;
            newTop = 0;
          }
          if (newLeft + newWidth > editorRect.width) {
            newWidth = editorRect.width - newLeft;
          }
          if (newTop + newHeight > editorRect.height) {
            newHeight = editorRect.height - newTop;
          }

          // Apply minimum dimensions
          newWidth = Math.max(100, newWidth);
          newHeight = Math.max(50, newHeight);

          // Update wrapper dimensions and position
          activeElement.style.width = `${newWidth}px`;
          activeElement.style.height = `${newHeight}px`;
          activeElement.style.left = `${newLeft}px`;
          activeElement.style.top = `${newTop}px`;

          // Update image dimensions
          const img = activeElement.querySelector('img');
          if (img) {
            img.style.width = '100%';
            img.style.height = '100%';
            img.style.objectFit = 'fill';
          }
        } else if (isDragging) {
          e.preventDefault();
          
          const editorRect = editor.getBoundingClientRect();
          const x = e.clientX - editorRect.left - startX;
          const y = e.clientY - editorRect.top - startY;
          
          // Constrain to editor bounds
          const maxX = editorRect.width - activeElement.offsetWidth;
          const maxY = editorRect.height - activeElement.offsetHeight;
          
          const newLeft = Math.max(0, Math.min(x, maxX));
          const newTop = Math.max(0, Math.min(y, maxY));
          
          activeElement.style.left = `${newLeft}px`;
          activeElement.style.top = `${newTop}px`;
          activeElement.style.transform = 'none';
        }
      };

      const handleMouseUp = () => {
        if (activeElement) {
          activeElement.classList.remove('opacity-50');
          activeElement.style.zIndex = '';
        }
        
        isDragging = false;
        isResizing = false;
        activeElement = null;
      };

      // Handle new image wrappers
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          mutation.addedNodes.forEach((node) => {
            if (node instanceof HTMLElement && node.classList.contains('image-wrapper')) {
              makeWrapperUneditable(node);
            }
          });
        });
      });

      observer.observe(editor, { childList: true, subtree: true });

      // Make existing wrappers uneditable
      editor.querySelectorAll('.image-wrapper').forEach(makeWrapperUneditable);

      editor.addEventListener('mousedown', handleMouseDown);
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);

      return () => {
        editor.removeEventListener('mousedown', handleMouseDown);
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        observer.disconnect();
      };
    }, [ref]);

    return (
      <div
        ref={ref}
        className={`min-h-[500px] w-full focus:outline-none relative p-4 ${className}`}
        contentEditable
        suppressContentEditableWarning
        style={{
          cursor: 'text',
          backgroundColor: 'white',
          border: '1px solid #e5e7eb',
          borderRadius: '0.5rem'
        }}
      >
        {children}
      </div>
    );
  }
);

DraggableEditor.displayName = 'DraggableEditor';