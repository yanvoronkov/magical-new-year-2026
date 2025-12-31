
import { GoogleGenAI, Modality } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const generateGreetingText = async (userName: string): Promise<string> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Напиши теплое и искреннее поздравление с Новым 2026 годом для человека по имени ${userName}.

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
5. "С Новым Годом!"

Пример хорошего поздравления:
"Дорогой Иван! Пусть Новый 2026 год принесет тебе радость и счастье. Желаю крепкого здоровья, успехов во всех делах и исполнения самых заветных мечтаний. Пусть каждый день будет наполнен теплом, любовью и приятными сюрпризами. Пусть удача сопровождает тебя на всех путях. С Новым Годом!"`,
    config: {
      temperature: 0.7,
      topP: 0.85,
    },
  });
  return response.text || "Дорогой друг! Желаю тебе счастья, здоровья и радости в новом году. Пусть все мечты сбываются! С Новым Годом!";
};

export const generateGreetingAudio = async (text: string): Promise<string | undefined> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: `Прочитай это поздравление очень теплым, добрым и праздничным голосом: ${text}` }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' }, // Warm voice
          },
        },
      },
    });
    return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  } catch (error) {
    console.error("Audio generation failed:", error);
    return undefined;
  }
};

export const decodeBase64 = (base64: string): Uint8Array => {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
};

export const decodeAudioData = async (
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number = 24000,
  numChannels: number = 1,
): Promise<AudioBuffer> => {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
};
