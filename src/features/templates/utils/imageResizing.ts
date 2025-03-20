export const setupImageResizing = (wrapper: HTMLElement) => {
  let isResizing = false;
  let currentHandle: string | null = null;
  let startX = 0;
  let startY = 0;
  let startWidth = 0;
  let startHeight = 0;

  const handles = wrapper.getElementsByClassName('resize-handle');
  Array.from(handles).forEach(handle => {
    handle.addEventListener('mousedown', (e: Event) => {
      isResizing = true;
      currentHandle = (handle as HTMLElement).className.split(' ')[1].replace('resize-handle-', '');
      startX = (e as MouseEvent).clientX;
      startY = (e as MouseEvent).clientY;
      startWidth = wrapper.offsetWidth;
      startHeight = wrapper.offsetHeight;
      
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      e.stopPropagation();
      e.preventDefault();
    });
  });

  const handleMouseMove = (e: MouseEvent) => {
    if (!isResizing) return;

    const deltaX = e.clientX - startX;
    const deltaY = e.clientY - startY;

    let newWidth = startWidth;
    let newHeight = startHeight;

    switch (currentHandle) {
      case 'e':
        newWidth = startWidth + deltaX;
        break;
      case 'w':
        newWidth = startWidth - deltaX;
        break;
      case 'n':
        newHeight = startHeight - deltaY;
        break;
      case 's':
        newHeight = startHeight + deltaY;
        break;
      case 'ne':
        newWidth = startWidth + deltaX;
        newHeight = startHeight - deltaY;
        break;
      case 'nw':
        newWidth = startWidth - deltaX;
        newHeight = startHeight - deltaY;
        break;
      case 'se':
        newWidth = startWidth + deltaX;
        newHeight = startHeight + deltaY;
        break;
      case 'sw':
        newWidth = startWidth - deltaX;
        newHeight = startHeight + deltaY;
        break;
    }

    wrapper.style.width = `${Math.max(50, newWidth)}px`;
    wrapper.style.height = 'auto';
    e.preventDefault();
    e.stopPropagation();
  };

  const handleMouseUp = () => {
    isResizing = false;
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };

  wrapper.addEventListener('mousedown', (e: Event) => {
    if (!(e.target as HTMLElement).classList.contains('resize-handle')) {
      wrapper.style.cursor = 'move';
    }
  });
};