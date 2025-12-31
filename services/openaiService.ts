// OpenAI Service через собственный API прокси (для обхода блокировок)

import { AI_CONFIG } from './aiConfig';

// API endpoint из переменной окружения (можно настроить в EasyPanel)
const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3001/api';

// Генерация текста поздравления через наш API
export const generateGreetingText = async (userName: string): Promise<string> => {
  const response = await fetch(`${API_BASE_URL}/generate-text`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ userName }),
  });

  if (!response.ok) {
    const error = await response.json();
    console.error('API Error:', error);
    throw new Error(`API error: ${response.status}`);
  }

  const data = await response.json();
  const text = data.text;
  
  if (!text) {
    throw new Error('No text generated from API');
  }

  console.log('✅ Текст сгенерирован через API:', text);
  return text;
};

// Генерация голоса через наш API
export const generateGreetingAudio = async (text: string): Promise<string | undefined> => {
  try {
    console.log(`🎤 Генерируем голос: ${AI_CONFIG.openai.voice}, скорость: ${AI_CONFIG.openai.speed}`);
    
    const response = await fetch(`${API_BASE_URL}/generate-voice`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        voice: AI_CONFIG.openai.voice,
        speed: AI_CONFIG.openai.speed,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('API TTS Error:', error);
      return undefined;
    }

    const data = await response.json();
    const audioBase64 = data.audioBase64;

    console.log('✅ Голос сгенерирован через API');
    return audioBase64;
  } catch (error) {
    console.error('Error generating audio:', error);
    return undefined;
  }
};

// Декодирование base64 в ArrayBuffer
export const decodeBase64 = (base64: string): ArrayBuffer => {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
};

// Декодирование аудио данных
export const decodeAudioData = async (
  audioBytes: ArrayBuffer,
  audioContext: AudioContext
): Promise<AudioBuffer> => {
  return await audioContext.decodeAudioData(audioBytes);
};
