export interface ColorTemplate {
  id: string;
  name: string;
  description: string;
  colors: string[];
  editPrompt: string; // Prompt for Gemini Image Edit
}

export interface FontTemplate {
  id: string;
  name: string;
  description: string;
  fontFamily: string; // Tailwind class
  textStylePrompt: string; // Prompt for Gemini to render text
}

export interface ProcessingState {
  status: 'idle' | 'uploading' | 'processing' | 'success' | 'error';
  message?: string;
}

export interface GeneratedResult {
  originalImage: string;
  editedImage: string;
  colorTemplateId: string;
  fontTemplateId: string;
}