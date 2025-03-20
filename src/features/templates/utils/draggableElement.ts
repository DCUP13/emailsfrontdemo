export const setupDraggableElement = (element: HTMLElement, container: HTMLElement) => {
  let isDragging = false;
  let isResizing = false;
  let startX = 0;
  let startY = 0;
  let startLeft = 0;
  let startTop = 0;
  let startWidth = 0;
  let currentHandle = '';

  // Ensure container is relative for absolute positioning
  if (getComputedStyle(container).position === 'static') {
    container.style.position = 'relative';
  }

  const handleDragStart = (e: MouseEvent) => {
    if (isResizing || (e.target as HTMLElement).classList.contains('resize-handle')) return;

    isDragging = true;
    const rect = element.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();

    startX = e.clientX - rect.left;
    startY = e.clientY - rect.top;
    startLeft = rect.left - containerRect.left;
    startTop = rect.top - containerRect.top;

    element.style.zIndex = '1000';
    element.classList.add('dragging');

    document.addEventListener('mousemove', handleDragMove);
    document.addEventListener('mouseup', handleDragEnd);
    e.preventDefault();
  };

  const handleDragMove = (e: MouseEvent) => {
    if (!isDragging) return;

    const containerRect = container.getBoundingClientRect();
    const elementRect = element.getBoundingClientRect();

    let left = e.clientX - containerRect.left - startX;
    let top = e.clientY - containerRect.top - startY;

    // Constrain to container bounds
    left = Math.max(0, Math.min(left, containerRect.width - elementRect.width));
    top = Math.max(0, Math.min(top, containerRect.height - elementRect.height));

    element.style.left = `${left}px`;
    element.style.top = `${top}px`;
  };

  const handleDragEnd = () => {
    if (!isDragging) return;
    isDragging = false;

    element.style.zIndex = '1';
    element.classList.remove('dragging');

    document.removeEventListener('mousemove', handleDragMove);
    document.removeEventListener('mouseup', handleDragEnd);
  };

  const handleResizeStart = (e: MouseEvent, handle: HTMLElement) => {
    isResizing = true;
    currentHandle = handle.className.split(' ')[1].replace('resize-handle-', '');
    startX = e.clientX;
    startWidth = element.offsetWidth;

    document.addEventListener('mousemove', handleResizeMove);
    document.addEventListener('mouseup', handleResizeEnd);
    e.stopPropagation();
    e.preventDefault();
  };

  const handleResizeMove = (e: MouseEvent) => {
    if (!isResizing) return;

    const deltaX = e.clientX - startX;
    let newWidth = startWidth;

    if (currentHandle.includes('e')) {
      newWidth = startWidth + deltaX;
    } else if (currentHandle.includes('w')) {
      newWidth = startWidth - deltaX;
    }

    // Ensure minimum width
    newWidth = Math.max(100, newWidth);
    
    // Constrain to container width
    const containerRect = container.getBoundingClientRect();
    const elementRect = element.getBoundingClientRect();
    const maxWidth = containerRect.width - (elementRect.left - containerRect.left);
    newWidth = Math.min(newWidth, maxWidth);

    element.style.width = `${newWidth}px`;
  };

  const handleResizeEnd = () => {
    isResizing = false;
    document.removeEventListener('mousemove', handleResizeMove);
    document.removeEventListener('mouseup', handleResizeEnd);
  };

  element.addEventListener('mousedown', handleDragStart);

  const handles = element.getElementsByClassName('resize-handle');
  Array.from(handles).forEach(handle => {
    handle.addEventListener('mousedown', (e) => handleResizeStart(e as MouseEvent, handle as HTMLElement));
  });

  return () => {
    element.removeEventListener('mousedown', handleDragStart);
    document.removeEventListener('mousemove', handleDragMove);
    document.removeEventListener('mouseup', handleDragEnd);
    document.removeEventListener('mousemove', handleResizeMove);
    document.removeEventListener('mouseup', handleResizeEnd);
  };
};