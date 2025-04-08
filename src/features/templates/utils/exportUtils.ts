import html2pdf from 'html2pdf.js';

export const generateHTML = (content: string, title: string): string => {
  // Create a temporary container to parse and modify the HTML
  const container = document.createElement('div');
  container.innerHTML = content;

  // Convert button elements to anchor tags
  const buttons = container.querySelectorAll('.button-wrapper button');
  buttons.forEach(button => {
    const url = button.getAttribute('data-url') || '#';
    const text = button.textContent || '';
    const style = button.getAttribute('style') || '';
    
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.textContent = text;
    anchor.className = 'template-button';
    anchor.style.cssText = style;
    
    // Replace the button with the anchor
    button.parentElement?.replaceChild(anchor, button);
  });

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
    }
    img {
      max-width: 100%;
      height: auto;
    }
    .template-button {
      display: inline-block;
      padding: 8px 16px;
      background-color: #4f46e5;
      color: white;
      border-radius: 6px;
      text-decoration: none;
      font-weight: 500;
      text-align: center;
      cursor: pointer;
      transition: background-color 0.2s;
    }
    .template-button:hover {
      background-color: #4338ca;
    }
    h1, h2, h3, h4, h5, h6 {
      color: #111;
      margin-top: 1.5em;
      margin-bottom: 0.5em;
    }
    p {
      margin: 1em 0;
    }
    ul, ol {
      margin: 1em 0;
      padding-left: 2em;
    }
  </style>
</head>
<body>
  ${container.innerHTML}
</body>
</html>`;
};

export const exportAsHTML = (content: string, title: string) => {
  const html = generateHTML(content, title);
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${title || 'template'}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export const exportAsDOCX = async (content: string, title: string) => {
  try {
    // For DOCX files, check if we have the original file stored
    const { originalFile } = JSON.parse(content);
    const binaryContent = atob(originalFile);
    const bytes = new Uint8Array(binaryContent.length);
    for (let i = 0; i < binaryContent.length; i++) {
      bytes[i] = binaryContent.charCodeAt(i);
    }
    
    const blob = new Blob([bytes], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title || 'template'}.docx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch {
    // If we don't have the original file, export as HTML
    alert('Original DOCX file not available. Downloading as HTML instead.');
    exportAsHTML(content, title);
  }
};

export const exportAsPDF = async (content: string, title: string) => {
  const html = generateHTML(content, title);
  const element = document.createElement('div');
  element.innerHTML = html;
  document.body.appendChild(element);

  const options = {
    margin: 10,
    filename: `${title || 'template'}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
  };

  try {
    await html2pdf().set(options).from(element).save();
  } finally {
    document.body.removeChild(element);
  }
};