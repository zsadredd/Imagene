import { GoogleGenAI } from "@google/genai";
import { ColorTemplate, FontTemplate } from '../types';

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key is missing. Please set process.env.API_KEY.");
  }
  return new GoogleGenAI({ apiKey });
};

/**
 * Step 1: Optical Character Recognition (OCR)
 * We use the Pro model (gemini-3-pro-preview) for superior text recognition, especially
 * with stylized or low-contrast text that the Flash model might miss.
 */
const extractTextFromImage = async (ai: GoogleGenAI, base64Data: string, mimeType: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Data,
              mimeType: mimeType,
            },
          },
          {
            text: `Analyze this image and extract all visible text.
            
            Guidelines:
            1. Transcribe the text EXACTLY as it appears. 
            2. Do not autocorrect creative spelling unless it is clearly an OCR error.
            3. Preserve line breaks.
            4. If the text is stylized, focus on the characters.
            
            Output strictly just the text content. If no text is found, return "EMPTY".`
          },
        ],
      },
    });
    return response.text?.trim() || 'EMPTY';
  } catch (error) {
    console.warn("OCR Pre-processing failed:", error);
    // If OCR fails, we return EMPTY and let the image model try its best implicitly
    return 'EMPTY';
  }
};

export const editImageWithTemplate = async (
  base64Image: string,
  colorTemplate: ColorTemplate,
  fontTemplate: FontTemplate
): Promise<string> => {
  const ai = getClient();
  
  // Extract correct mime type
  const mimeMatch = base64Image.match(/^data:(image\/[a-zA-Z]+);base64,/);
  const mimeType = mimeMatch ? mimeMatch[1] : 'image/png';

  // Clean base64 string
  const cleanBase64 = base64Image.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, '');

  // Step 1: Perform OCR to get the text content
  const detectedText = await extractTextFromImage(ai, cleanBase64, mimeType);

  try {
    // Step 2: Construct the generation prompt with the detected text as a hard constraint
    const textInstructions = detectedText !== 'EMPTY' 
      ? `
      [MANDATORY TEXT CONTENT]
      The original image contains the following text which MUST be preserved:
      "${detectedText}"
      
      TYPOGRAPHY INSTRUCTIONS:
      1. RENDER EXACTLY: You must write "${detectedText}" in the image.
      2. SPELLING CHECK: Do not change the spelling.
      3. FONT STYLE: Apply the "${fontTemplate.textStylePrompt}" typography style.
      4. PLACEMENT: Place the text prominently where it fits the composition best, similar to the original layout if possible.
      5. LEGIBILITY: Ensure high contrast between text and background.
      ` 
      : `
      [NO TEXT DETECTED]
      The input appears to have no text. Do not generate any text. Focus on the visual art style.
      `;

    const strongPrompt = `
    ACTION: Redraw the image completely in the target style.

    [VISUAL STYLE]
    1. ART DIRECTION: ${colorTemplate.editPrompt}
    2. COLOR PALETTE: You MUST use these colors primarily: ${colorTemplate.colors.join(', ')}.
    3. TRANSFORMATION: Replace all original textures. The image should look like it was created from scratch in the new style.

    ${textInstructions}

    [COMPOSITION]
    1. Keep the main subject centered or in its original composition.
    2. Ensure text is NOT covered by objects.
    3. Make text HIGHLY READABLE against the background.

    [STRICT PROHIBITIONS]
    1. Do NOT add any extra words, captions, or watermarks.
    2. Do NOT remove the existing text listed above.
    3. Do NOT distort the text characters beyond recognition.

    OUTPUT: A fully stylized image.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image', 
      contents: {
        parts: [
          {
            inlineData: {
              data: cleanBase64,
              mimeType: mimeType,
            },
          },
          {
            text: strongPrompt,
          },
        ],
      },
    });

    if (response.candidates && response.candidates[0].content.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData && part.inlineData.data) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
    }

    throw new Error("No image data returned from Gemini.");
  } catch (error) {
    console.error("Gemini Image Edit Error:", error);
    throw error;
  }
};