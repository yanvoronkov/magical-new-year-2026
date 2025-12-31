// Универсальный сервис для работы с AI
// Автоматически выбирает провайдера на основе конфигурации

import { AI_CONFIG } from './aiConfig';
import * as gemini from './geminiService';
import * as openai from './openaiService';

// Генерация текста поздравления
export const generateGreetingText = async (userName: string): Promise<string> => {
  console.log(`🤖 Используем ${AI_CONFIG.textProvider} для генерации текста`);
  
  switch (AI_CONFIG.textProvider) {
    case 'openai':
      return await openai.generateGreetingText(userName);
    case 'gemini':
      return await gemini.generateGreetingText(userName);
    default:
      throw new Error(`Unknown text provider: ${AI_CONFIG.textProvider}`);
  }
};

// Генерация голоса
export const generateGreetingAudio = async (text: string): Promise<string | undefined> => {
  console.log(`🎤 Используем ${AI_CONFIG.voiceProvider} для генерации голоса`);
  
  switch (AI_CONFIG.voiceProvider) {
    case 'openai':
      return await openai.generateGreetingAudio(text);
    case 'gemini':
      return await gemini.generateGreetingAudio(text);
    default:
      throw new Error(`Unknown voice provider: ${AI_CONFIG.voiceProvider}`);
  }
};

// Вспомогательные функции (используем из openai, т.к. они универсальные)
export const decodeBase64 = openai.decodeBase64;
export const decodeAudioData = openai.decodeAudioData;
