export interface Template {
  id: string;
  name: string;
  content: string;
  lastModified: string;
  format: 'html' | 'docx' | 'pdf';
  imported?: boolean;
}

export interface TemplateElement {
  id: string;
  type: 'heading' | 'text' | 'image' | 'button' | 'list' | 'grid';
  content: string;
  styles: Record<string, string>;
  url?: string;
}