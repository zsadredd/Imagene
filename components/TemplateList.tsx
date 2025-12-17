import React from 'react';
import { ColorTemplate, FontTemplate } from '../types';
import { clsx } from 'clsx';
import { Check } from 'lucide-react';

interface TemplateListProps<T extends ColorTemplate | FontTemplate> {
  items: T[];
  selectedId: string | null;
  onSelect: (item: T) => void;
  variant: 'color' | 'font';
  disabled?: boolean;
}

export const TemplateList = <T extends ColorTemplate | FontTemplate>({ 
  items, 
  selectedId, 
  onSelect, 
  variant,
  disabled 
}: TemplateListProps<T>) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
      {items.map((item) => {
        const isSelected = selectedId === item.id;
        
        return (
          <button
            key={item.id}
            onClick={() => onSelect(item)}
            disabled={disabled}
            className={clsx(
              "relative group flex flex-col items-start p-4 rounded-xl border-2 transition-all text-left min-h-[120px]",
              isSelected 
                ? "border-indigo-500 bg-gray-800 shadow-[0_0_15px_rgba(99,102,241,0.3)]" 
                : "border-gray-700 bg-gray-900/50 hover:bg-gray-800 hover:border-gray-600",
              disabled && "opacity-50 cursor-not-allowed"
            )}
          >
            {isSelected && (
              <div className="absolute top-2 right-2 p-1 bg-indigo-500 rounded-full z-10">
                <Check className="w-3 h-3 text-white" />
              </div>
            )}
            
            {variant === 'color' && 'colors' in item && (
              <div className="flex -space-x-2 mb-3">
                {item.colors.map((color, i) => (
                  <div 
                    key={i} 
                    className="w-6 h-6 rounded-full border border-gray-600 shadow-sm"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            )}

            {variant === 'font' && 'fontFamily' in item && (
              <div className="mb-3 w-full">
                 <span className={clsx("text-2xl", item.fontFamily)}>Aa</span>
              </div>
            )}

            <h3 className={clsx("text-lg font-bold mb-1", 
               variant === 'font' && 'fontFamily' in item ? item.fontFamily : ""
            )}>
              {item.name}
            </h3>
            <p className="text-xs text-gray-400 leading-snug">
              {item.description}
            </p>
          </button>
        );
      })}
    </div>
  );
};