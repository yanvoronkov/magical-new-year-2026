// OpenAI Service для генерации текста и голоса

import { AI_CONFIG } from './aiConfig';

const OPENAI_API_KEY = (import.meta as any).env?.VITE_OPENAI_API_KEY || '';

// Генерация текста поздравления через ChatGPT
export const generateGreetingText = async (userName: string): Promise<string> => {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo', // или 'gpt-4' для лучшего качества
      messages: [
        {
          role: 'system',
          content: `Ты - помощник для создания новогодних поздравлений. Твоя задача - написать теплое и искреннее поздравление.

ВАЖНЫЕ ТРЕБОВАНИЯ:
- Поздравление должно быть из 5-6 предложений
- Используй красивый, но ПРОСТОЙ язык
- Можно использовать поэтические обороты, НО только с простыми словами
- Избегай слов с неоднозначными ударениями (типа "замок", "атлас", "ирис", "хаос")
- Пиши среднего размера предложениями (не слишком короткими и не слишком длинными)
- Говори тепло, искренне, как добрый друг или родственник
- ОБЯЗАТЕЛЬНО закончи поздравление фразой "С Новым Годом!"

Примерная структура:
1. Обращение и пожелание
2. Что пожелать (счастье, здоровье)
3. Что пожелать (успех, удача)
4. Напутствие или добрые слова
5. "С Новым Годом!"`
        },
        {
          role: 'user',
          content: `Напиши теплое поздравление с Новым 2026 годом для человека по имени ${userName}.`
        }
      ],
      temperature: 0.7,
      max_tokens: 300,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    console.error('OpenAI API Error:', error);
    throw new Error(`OpenAI API error: ${response.status}`);
  }

  const data = await response.json();
  const text = data.choices[0]?.message?.content?.trim();
  
  if (!text) {
    throw new Error('No text generated from OpenAI');
  }

  console.log('✅ Текст сгенерирован через OpenAI:', text);
  return text;
};

// Генерация голоса через OpenAI TTS
export const generateGreetingAudio = async (text: string): Promise<string | undefined> => {
  try {
    console.log(`🎤 Генерируем голос: ${AI_CONFIG.openai.voice}, скорость: ${AI_CONFIG.openai.speed}`);
    
    const response = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: AI_CONFIG.openai.voiceModel,
        input: text,
        voice: AI_CONFIG.openai.voice, // Берем из конфига!
        response_format: 'mp3',
        speed: AI_CONFIG.openai.speed, // Берем из конфига!
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('OpenAI TTS Error:', error);
      return undefined;
    }

    // Получаем MP3 как blob
    const audioBlob = await response.blob();
    
    // Конвертируем в base64
    const arrayBuffer = await audioBlob.arrayBuffer();
    const base64 = btoa(
      new Uint8Array(arrayBuffer).reduce((data, byte) => data + String.fromCharCode(byte), '')
    );

    console.log('✅ Голос сгенерирован через OpenAI TTS');
    return base64;
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
