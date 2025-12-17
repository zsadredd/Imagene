import React, { useCallback } from 'react';
import { Upload, Image as ImageIcon } from 'lucide-react';
import { clsx } from 'clsx';

interface ImageUploadProps {
  onImageSelect: (base64: string) => void;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({ onImageSelect }) => {
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    
    const reader = new FileReader();
    reader.onloadend = () => {
      onImageSelect(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  return (
    <div className="w-full">
      <label 
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-700 border-dashed rounded-xl cursor-pointer bg-gray-900/50 hover:bg-gray-800 hover:border-indigo-500 transition-all group"
      >
        <div className="flex flex-col items-center justify-center pt-5 pb-6 text-gray-400 group-hover:text-white transition-colors">
          <div className="p-4 rounded-full bg-gray-800 mb-4 group-hover:bg-indigo-600/20 group-hover:text-indigo-400 transition-colors">
             <Upload className="w-8 h-8" />
          </div>
          <p className="mb-2 text-sm font-semibold">
            Click to upload or drag and drop
          </p>
          <p className="text-xs text-gray-500 group-hover:text-gray-400">
            SVG, PNG, JPG or GIF (MAX. 800x800px recommended)
          </p>
        </div>
        <input 
          type="file" 
          className="hidden" 
          accept="image/*"
          onChange={handleFileChange}
        />
      </label>
    </div>
  );
};