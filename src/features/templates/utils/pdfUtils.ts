import * as pdfjsLib from 'pdfjs-dist';

// Get the worker from the CDN
const PDFJS_WORKER_URL = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

// Initialize PDF.js with the worker
pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJS_WORKER_URL;

export const extractPDFContent = async (arrayBuffer: ArrayBuffer): Promise<string> => {
  try {
    // Load the PDF document
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    
    // Extract text from each page
    let content = '';
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .filter((item: any) => item.str.trim().length > 0) // Filter out empty strings
        .map((item: any) => item.str)
        .join(' ');
      
      if (pageText.trim()) {
        content += `<div class="pdf-page">${pageText}</div>`;
      }
    }
    
    return content || '<div class="pdf-page">No text content found in PDF</div>';
  } catch (error) {
    console.error('Error extracting PDF content:', error);
    throw new Error('Failed to extract PDF content. Please try a different file.');
  }
};