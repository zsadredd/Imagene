import React, { useState } from 'react';
import { TemplateList } from './components/TemplateList';
import { ImageUpload } from './components/ImageUpload';
import { ResultDisplay } from './components/ResultDisplay';
import { Button } from './components/Button';
import { ColorTemplate, FontTemplate, ProcessingState, GeneratedResult } from './types';
import { editImageWithTemplate } from './services/geminiService';
import { Palette, Sparkles, Wand2, Type } from 'lucide-react';
import { COLOR_TEMPLATES, FONT_TEMPLATES } from './constants';
import { clsx } from 'clsx';

const App: React.FC = () => {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  
  // Split State
  const [selectedColorTemplate, setSelectedColorTemplate] = useState<ColorTemplate | null>(null);
  const [selectedFontTemplate, setSelectedFontTemplate] = useState<FontTemplate | null>(null);
  
  const [processingState, setProcessingState] = useState<ProcessingState>({ status: 'idle' });
  const [result, setResult] = useState<GeneratedResult | null>(null);

  const handleImageSelect = (base64: string) => {
    setOriginalImage(base64);
    setResult(null);
    setProcessingState({ status: 'idle' });
    
    // Auto-select defaults
    if (!selectedColorTemplate) setSelectedColorTemplate(COLOR_TEMPLATES[0]);
    if (!selectedFontTemplate) setSelectedFontTemplate(FONT_TEMPLATES[0]);
  };

  const handleGenerate = async () => {
    if (!originalImage || !selectedColorTemplate || !selectedFontTemplate) return;

    setProcessingState({ status: 'processing', message: 'Applying style transformation...' });

    try {
      // Edit the image using Gemini Vision (Color/Visual Style + Typography)
      const editedImage = await editImageWithTemplate(
        originalImage, 
        selectedColorTemplate, 
        selectedFontTemplate
      );
      
      setResult({
        originalImage,
        editedImage,
        colorTemplateId: selectedColorTemplate.id,
        fontTemplateId: selectedFontTemplate.id
      });
      setProcessingState({ status: 'success' });
    } catch (error) {
      console.error(error);
      setProcessingState({ 
        status: 'error', 
        message: 'Something went wrong. The image might be too complex or the service is busy.' 
      });
    }
  };

  const handleReset = () => {
    setOriginalImage(null);
    setResult(null);
    setProcessingState({ status: 'idle' });
    setSelectedColorTemplate(null);
    setSelectedFontTemplate(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 to-gray-900 text-gray-100 font-sans selection:bg-indigo-500/30">
      
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-950/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-600 rounded-lg">
              <Palette className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
              ChromaType AI
            </h1>
          </div>
          <div className="text-sm text-gray-400 flex items-center gap-1">
             <span className="hidden sm:inline">Powered by Gemini 2.5</span>
             <Sparkles className="w-3 h-3 text-yellow-400" />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {!result ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            
            {/* Left Column: Input & Controls */}
            <div className="lg:col-span-6 space-y-10">
              
              {/* Step 1: Upload */}
              <section>
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-800 text-xs border border-gray-700">1</span>
                  Upload Source
                </h2>
                {!originalImage ? (
                  <ImageUpload onImageSelect={handleImageSelect} />
                ) : (
                  <div className="relative group rounded-xl overflow-hidden border border-gray-700">
                    <img src={originalImage} alt="Original" className="w-full h-48 object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Button size="sm" variant="secondary" onClick={() => setOriginalImage(null)}>Change Image</Button>
                    </div>
                  </div>
                )}
              </section>

              {/* Step 2: Color Style */}
              <section className={!originalImage ? 'opacity-50 pointer-events-none' : ''}>
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                   <span className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-800 text-xs border border-gray-700">2</span>
                   Select Color Grade
                </h2>
                <TemplateList<ColorTemplate> 
                  items={COLOR_TEMPLATES}
                  variant="color"
                  selectedId={selectedColorTemplate?.id || null} 
                  onSelect={setSelectedColorTemplate}
                  disabled={processingState.status === 'processing'}
                />
              </section>

              {/* Step 3: Typography Style */}
              <section className={!originalImage ? 'opacity-50 pointer-events-none' : ''}>
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                   <span className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-800 text-xs border border-gray-700">3</span>
                   Select Typography Style
                </h2>
                <TemplateList<FontTemplate> 
                  items={FONT_TEMPLATES}
                  variant="font"
                  selectedId={selectedFontTemplate?.id || null} 
                  onSelect={setSelectedFontTemplate}
                  disabled={processingState.status === 'processing'}
                />
              </section>

               <div className={!originalImage || !selectedColorTemplate || !selectedFontTemplate ? 'opacity-50 pointer-events-none' : ''}>
                 <Button 
                   onClick={handleGenerate} 
                   className="w-full py-4 text-lg shadow-lg shadow-indigo-500/20" 
                   isLoading={processingState.status === 'processing'}
                 >
                   <Wand2 className="w-5 h-5 mr-2" />
                   Generate Masterpiece
                 </Button>
                 {processingState.status === 'error' && (
                   <p className="mt-3 text-red-400 text-sm text-center bg-red-900/20 p-2 rounded-lg border border-red-900/50">
                     {processingState.message}
                   </p>
                 )}
               </div>
            </div>

            {/* Right Column: Preview / Explainer */}
            <div className="lg:col-span-6 flex flex-col items-center justify-center min-h-[500px] bg-gray-900/30 rounded-2xl border border-gray-800/50 p-8 sticky top-24 h-fit">
               {originalImage && selectedColorTemplate && selectedFontTemplate ? (
                 <div className="text-center space-y-6 max-w-md w-full">
                   
                   <div className="w-20 h-20 bg-gray-800 rounded-full mx-auto flex items-center justify-center animate-pulse border border-indigo-500/30">
                     <Sparkles className="w-10 h-10 text-indigo-400" />
                   </div>
                   
                   <div>
                      <h3 className="text-2xl font-bold text-white mb-2">Ready to Transform</h3>
                      <p className="text-gray-400">
                        Applying <span className="text-indigo-400 font-semibold">{selectedColorTemplate.name}</span> color grading.
                      </p>
                   </div>

                   {/* Preview Card */}
                   <div className="bg-gray-800/50 p-4 rounded-xl border border-gray-700 text-left space-y-3">
                      <div className="flex items-center gap-3">
                         <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center">
                            <Palette className="w-4 h-4 text-indigo-300" />
                         </div>
                         <div>
                            <p className="text-xs text-gray-400">Color Profile</p>
                            <p className="font-medium text-sm">{selectedColorTemplate.name}</p>
                         </div>
                      </div>
                      <div className="flex items-center gap-3">
                         <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center">
                            <Type className="w-4 h-4 text-purple-300" />
                         </div>
                         <div>
                            <p className="text-xs text-gray-400">Typography Style</p>
                            <p className={clsx("font-medium text-2xl leading-none mt-1", selectedFontTemplate.fontFamily)}>Aa</p>
                            <p className="text-xs text-gray-500">{selectedFontTemplate.name}</p>
                         </div>
                      </div>
                   </div>

                 </div>
               ) : (
                 <div className="text-center space-y-4 max-w-sm text-gray-500">
                    <div className="grid grid-cols-2 gap-2 mb-8 opacity-20">
                      <div className="h-24 bg-gray-700 rounded-lg"></div>
                      <div className="h-24 bg-gray-700 rounded-lg"></div>
                      <div className="h-24 bg-gray-700 rounded-lg"></div>
                      <div className="h-24 bg-gray-700 rounded-lg"></div>
                    </div>
                    <p>Follow the steps to select your image, color grade, and typography style.</p>
                 </div>
               )}
            </div>

          </div>
        ) : (
          <ResultDisplay result={result} onReset={handleReset} />
        )}
      </main>
    </div>
  );
};

export default App;