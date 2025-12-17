import React from 'react';
import { GeneratedResult } from '../types';
import { COLOR_TEMPLATES, FONT_TEMPLATES } from '../constants';
import { Download, RefreshCw, Type } from 'lucide-react';
import { Button } from './Button';
import { clsx } from 'clsx';

interface ResultDisplayProps {
  result: GeneratedResult;
  onReset: () => void;
}

export const ResultDisplay: React.FC<ResultDisplayProps> = ({ result, onReset }) => {
  const colorTemplate = COLOR_TEMPLATES.find(t => t.id === result.colorTemplateId);
  const fontTemplate = FONT_TEMPLATES.find(t => t.id === result.fontTemplateId);

  if (!colorTemplate || !fontTemplate) return null;

  const handleDownload = () => {
    // Basic download for the image file only
    const link = document.createElement('a');
    link.href = result.editedImage;
    link.download = `chromatype-${colorTemplate.id}-${fontTemplate.id}-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col items-center w-full animate-fade-in">
      <div className="relative group w-full max-w-2xl rounded-lg overflow-hidden shadow-2xl bg-black border border-gray-800">
        
        {/* The Image */}
        <img 
          src={result.editedImage} 
          alt="Transformed" 
          className="w-full h-auto object-cover"
        />

        {/* Font Preview Badge (since no captions, we show the font used as a badge) */}
        <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
           <span className={clsx("text-white text-sm", fontTemplate.fontFamily)}>
             Style: {fontTemplate.name}
           </span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mt-8">
        <Button onClick={onReset} variant="secondary">
          <RefreshCw className="w-4 h-4 mr-2" />
          Start Over
        </Button>
        <Button onClick={handleDownload} variant="primary">
          <Download className="w-4 h-4 mr-2" />
          Download Image
        </Button>
      </div>
      
      <div className="mt-6 flex gap-2 items-center text-xs text-gray-500">
        <Type className="w-3 h-3" />
        <span>Typeface selected: {fontTemplate.name}</span>
      </div>
    </div>
  );
};