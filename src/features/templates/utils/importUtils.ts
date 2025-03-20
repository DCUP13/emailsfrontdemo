import { Template } from '../types';
import mammoth from 'mammoth';
import { extractPDFContent } from './pdfUtils';

export const parseHTML = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const parser = new DOMParser();
        const doc = parser.parseFromString(content, 'text/html');
        
        // Extract the body content
        const body = doc.body;
        
        // Clean up any scripts
        const scripts = body.getElementsByTagName('script');
        Array.from(scripts).forEach(script => script.remove());
        
        resolve(body.innerHTML);
      } catch (error) {
        reject(new Error('Failed to parse HTML file'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read HTML file'));
    reader.readAsText(file);
  });
};

export const parseDOCX = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        // Store the original file content as base64
        const base64Content = e.target?.result as ArrayBuffer;
        const base64String = btoa(
          new Uint8Array(base64Content)
            .reduce((data, byte) => data + String.fromCharCode(byte), '')
        );

        // Also convert to HTML for preview
        const result = await mammoth.convertToHtml({ arrayBuffer: base64Content });
        
        // Return both the original file and the HTML preview
        resolve(JSON.stringify({
          originalFile: base64String,
          preview: result.value
        }));
      } catch (error) {
        reject(new Error('Failed to parse DOCX file'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read DOCX file'));
    reader.readAsArrayBuffer(file);
  });
};

export const parsePDF = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const arrayBuffer = e.target?.result as ArrayBuffer;
        const content = await extractPDFContent(arrayBuffer);
        resolve(content);
      } catch (error) {
        console.error('PDF parsing error:', error);
        reject(new Error('Failed to parse PDF file'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read PDF file'));
    reader.readAsArrayBuffer(file);
  });
};

export const extractFileName = (file: File): string => {
  return file.name.replace(/\.[^/.]+$/, '');
};

export const createTemplateFromFile = async (file: File): Promise<Template> => {
  const fileName = extractFileName(file);
  const fileExtension = file.name.split('.').pop()?.toLowerCase();
  let content = '';
  let format: 'html' | 'docx' | 'pdf' = 'html';
  
  try {
    switch (fileExtension) {
      case 'html':
        content = await parseHTML(file);
        format = 'html';
        break;
      case 'docx':
        content = await parseDOCX(file);
        format = 'docx';
        break;
      case 'pdf':
        content = await parsePDF(file);
        format = 'pdf';
        break;
      default:
        throw new Error('Unsupported file format');
    }

    return {
      id: Math.random().toString(36).substr(2, 9),
      name: fileName,
      content,
      lastModified: new Date().toISOString(),
      format,
      imported: true
    };
  } catch (error) {
    console.error('Import error:', error);
    throw new Error(`Failed to import ${fileExtension?.toUpperCase()} file. Please try again.`);
  }
};