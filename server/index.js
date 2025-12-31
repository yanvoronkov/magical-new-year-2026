const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch'); // node-fetch v2 поддерживает agent
const { HttpsProxyAgent } = require('https-proxy-agent');

const app = express();
app.use(cors());
app.use(express.json());

const OPENAI_API_KEY = process.env.VITE_OPENAI_API_KEY;
const PROXY_URL = process.env.PROXY_URL; // http://username:password@host:port

// Создаем proxy agent
const agent = PROXY_URL ? new HttpsProxyAgent(PROXY_URL) : undefined;

console.log('🔧 Proxy:', PROXY_URL ? 'Enabled' : 'Disabled');

// Генерация текста через ChatGPT
app.post('/api/generate-text', async (req, res) => {
  try {
    const { userName } = req.body;
    
    console.log('📝 Generating text for:', userName);
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: `Ты - помощник для создания новогодних поздравлений. Твоя задача - написать теплое и искреннее поздравление.

ВАЖНЫЕ ТРЕБОВАНИЯ:
- Поздравление должно быть из 5-6 предложений
- Используй красивый, но ПРОСТОЙ язык
- Можно использовать поэтические обороты, НО только с простыми словами
- Избегай слов с неоднозначными ударениями
- Пиши среднего размера предложениями
- Говори тепло, искренне, как добрый друг или родственник
- ОБЯЗАТЕЛЬНО закончи поздравление фразой "С Новым Годом!"`
          },
          {
            role: 'user',
            content: `Напиши теплое поздравление с Новым 2026 годом для человека по имени ${userName}.`
          }
        ],
        temperature: 0.7,
        max_tokens: 300,
      }),
      agent, // Используем proxy agent
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('OpenAI Error:', error);
      return res.status(response.status).json({ error: error.error?.message });
    }

    const data = await response.json();
    const text = data.choices[0]?.message?.content?.trim();
    
    console.log('✅ Text generated');
    res.json({ text });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Генерация голоса через TTS
app.post('/api/generate-voice', async (req, res) => {
  try {
    const { text, voice = 'cedar', speed = 0.9 } = req.body;
    
    console.log('🎤 Generating voice:', voice);
    
    const response = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini-tts',
        input: text,
        voice,
        response_format: 'mp3',
        speed,
      }),
      agent, // Используем proxy agent
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('TTS Error:', error);
      return res.status(response.status).json({ error: error.error?.message });
    }

    // Получаем MP3 как blob
    const audioBuffer = await response.arrayBuffer();
    
    // Конвертируем в base64
    const base64 = Buffer.from(audioBuffer).toString('base64');
    
    console.log('✅ Voice generated');
    res.json({ audioBase64: base64 });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', proxy: !!PROXY_URL });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 API Server running on port ${PORT}`);
  console.log(`🔧 Proxy: ${PROXY_URL ? 'Enabled ✅' : 'Disabled ❌'}`);
});
