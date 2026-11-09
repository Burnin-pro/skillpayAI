import { GoogleGenerativeAI } from '@google/generative-ai';
import { env } from '../../config/env.js';
import pino from 'pino';

const logger = pino();
const genAI = env.AI_API_KEY ? new GoogleGenerativeAI(env.AI_API_KEY) : null;

export const generateJSON = async ({ system, user, schema, temperature = 0.2 }) => {
  if (!genAI) {
    throw new Error('Gemini API key not configured');
  }

  const model = genAI.getGenerativeModel({
    model: env.AI_MODEL || 'gemini-3.8-flash',
    systemInstruction: system,
    generationConfig: {
      temperature,
      responseMimeType: "application/json",
    }
  });

  const prompt = `${user}\n\nIMPORTANT: Return strictly valid JSON object matching the requested schema. DO NOT wrap with markdown, backticks, or extra commentary. Return only the raw JSON object.`;
  
  try {
    const result = await Promise.race([
      model.generateContent(prompt),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Gemini API Timeout')), 15000))
    ]);
    
    const responseText = result.response.text();
    let jsonString = responseText.trim();
    if (jsonString.startsWith('```json')) jsonString = jsonString.slice(7);
    if (jsonString.startsWith('```')) jsonString = jsonString.slice(3);
    if (jsonString.endsWith('```')) jsonString = jsonString.slice(0, -3);

    return JSON.parse(jsonString.trim());
  } catch (error) {
    logger.error({ error: error.message }, 'Gemini Generation Failed');
    throw error;
  }
};
