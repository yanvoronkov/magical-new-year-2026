import React, { useState, useCallback, useRef } from "react";
import { AppState, GreetingData } from "./types";
import * as ai from "./services/aiService";
import Snowfall from "./components/Snowfall";
import Postcard from "./components/Postcard";
import LoadingAnimation from "./components/LoadingAnimation";

// Массив фоновых музыкальных треков для случайного выбора
const BACKGROUND_MUSIC_TRACKS = [
  "/music/jingle-bells.mp3",
  // Можно добавить больше треков:
  // '/music/silent-night.mp3',
  // '/music/we-wish-you.mp3',
  // '/music/deck-the-halls.mp3',
];

const App: React.FC = () => {
  const [state, setState] = useState<AppState>(AppState.IDLE);
  const [name, setName] = useState("");
  const [greeting, setGreeting] = useState<
    (GreetingData & { duration: number }) | null
  >(null);
  const [audioTrigger, setAudioTrigger] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const backgroundBufferRef = useRef<AudioBuffer | null>(null);
  const backgroundSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const backgroundMusicActiveRef = useRef<boolean>(false);
  const selectedTrackRef = useRef<string | null>(null);

  // Procedural Fallback Music (Christmas Chimes)
  const playProceduralMusic = () => {
    if (!audioCtxRef.current) return;
    const ctx = audioCtxRef.current;
    backgroundMusicActiveRef.current = true;

    const playNote = (
      freq: number,
      startTime: number,
      duration: number = 0.5
    ) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, startTime);
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.05, startTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(startTime);
      osc.stop(startTime + duration);
    };

    const jingleBells = [
      { f: 659.25, d: 0.4 },
      { f: 659.25, d: 0.4 },
      { f: 659.25, d: 0.8 },
      { f: 659.25, d: 0.4 },
      { f: 659.25, d: 0.4 },
      { f: 659.25, d: 0.8 },
      { f: 659.25, d: 0.4 },
      { f: 783.99, d: 0.4 },
      { f: 523.25, d: 0.4 },
      { f: 587.33, d: 0.4 },
      { f: 659.25, d: 1.2 },
    ];

    const loop = () => {
      if (!backgroundMusicActiveRef.current) return;
      const now = ctx.currentTime;
      let timeOffset = 0.5;
      jingleBells.forEach((note) => {
        playNote(note.f, now + timeOffset, note.d * 1.5);
        timeOffset += note.d * 1.1;
      });
      setTimeout(loop, 8000);
    };
    loop();
  };

  const loadBackgroundMusic = async () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext ||
        (window as any).webkitAudioContext)({ sampleRate: 24000 });
    }
    const ctx = audioCtxRef.current;
    
    // Случайный выбор трека из массива
    const randomTrack = BACKGROUND_MUSIC_TRACKS[Math.floor(Math.random() * BACKGROUND_MUSIC_TRACKS.length)];
    selectedTrackRef.current = randomTrack;
    
    console.log(`🎵 Загружаем фоновую музыку: ${randomTrack}`);
    
    try {
      const response = await fetch(randomTrack);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const contentType = response.headers.get("content-type");
      if (contentType && !contentType.includes("audio") && !contentType.includes("application/octet-stream")) {
        throw new Error("Response is not audio data");
      }

      const arrayBuffer = await response.arrayBuffer();
      // Use the older callback syntax for better compatibility if needed, or wrap in try/catch
      try {
        const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
        backgroundBufferRef.current = audioBuffer;
        console.log(`✅ Музыка загружена успешно! Длительность: ${audioBuffer.duration.toFixed(1)}s`);
      } catch (decodeErr) {
        console.warn("Native decode failed, will use procedural fallback.", decodeErr);
      }
    } catch (err) {
      console.warn("Background music file not found or invalid. Using procedural fallback.", err);
    }
  };

   // Воспроизведение фоновой музыки
  const playBackgroundMusic = useCallback(() => {
    if (backgroundSourceRef.current) return; // Уже играет

    const ctx = audioCtxRef.current;
    if (!ctx) return;

    if (!backgroundBufferRef.current) {
      console.warn('⚠️ Фоновая музыка еще не загружена');
      return;
    }

    // Для мобильных используем HTML5 Audio как fallback
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    
    if (isMobile) {
      console.log('📱 Мобильное устройство - используем HTML5 Audio для музыки');
      const audio = new Audio('/music/jingle-bells.mp3');
      audio.volume = 0.05; // Тихая музыка (5%)
      audio.loop = true;
      audio.play().then(() => {
        console.log('✅ Мобильное аудио запущено');
      }).catch(err => {
        console.warn('⚠️ Не удалось запустить мобильное аудио:', err);
      });
    } else {
      // Desktop - используем Web Audio API
      try {
        const source = ctx.createBufferSource();
        source.buffer = backgroundBufferRef.current;
        const gainNode = ctx.createGain();
        gainNode.gain.setValueAtTime(0.05, ctx.currentTime); // Музыка еще тише (5%)
        source.connect(gainNode);
        gainNode.connect(ctx.destination);
        source.loop = true;
        source.start(0);
        backgroundSourceRef.current = source;
        console.log('✅ Фоновая музыка запущена (Web Audio API)');
      } catch (error) {
        console.error('❌ Ошибка воспроизведения фоновой музыки:', error);
      }
    }
  }, []);

  const startCelebration = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setState(AppState.LOADING);
    try {
      const loadMusicPromise = loadBackgroundMusic();
      const textPromise = ai.generateGreetingText(name);

      const [text] = await Promise.all([textPromise, loadMusicPromise]);
      const audioData = await ai.generateGreetingAudio(text);

      let duration = 5;
      if (audioData) {
        if (!audioCtxRef.current) {
          audioCtxRef.current = new (window.AudioContext ||
            (window as any).webkitAudioContext)({ sampleRate: 24000 });
        }
        const audioBytes = ai.decodeBase64(audioData);
        const buffer = await ai.decodeAudioData(
          audioBytes,
          audioCtxRef.current
        );
        duration = buffer.duration;

        setGreeting({ text, audioBase64: audioData, duration });
      } else {
        setGreeting({ text, duration: 5 });
      }

      setState(AppState.CELEBRATING);
    } catch (err) {
      console.error(err);
      setState(AppState.ERROR);
    }
  };

  const handleStartMagic = useCallback(async () => {
    if (!greeting || audioTrigger) return;

    console.log('🎭 Начинаем магию!', { greeting, audioTrigger });

    try {
      // Создаем AudioContext ЗДЕСЬ, после клика пользователя (для мобильных!)
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext ||
          (window as any).webkitAudioContext)({ sampleRate: 24000 });
        console.log('🔊 AudioContext создан:', audioCtxRef.current.state);
      }

      const ctx = audioCtxRef.current;
      
      // Обязательно resume для мобильных
      if (ctx.state === "suspended") {
        await ctx.resume();
        console.log('🔊 AudioContext resumed:', ctx.state);
      }

      // Небольшая задержка для мобильных браузеров
      await new Promise(resolve => setTimeout(resolve, 100));

      playBackgroundMusic();
      console.log('🎵 Фоновая музыка запущена');

      if (greeting.audioBase64) {
        console.log('🎤 Начинаем воспроизведение голоса, длительность:', greeting.duration);
        
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
        
        if (isMobile) {
          // Мобильный fallback - используем HTML5 Audio
          console.log('📱 Используем HTML5 Audio для голоса');
          try {
            const audioBytes = ai.decodeBase64(greeting.audioBase64);
            const blob = new Blob([audioBytes], { type: 'audio/mp3' });
            const url = URL.createObjectURL(blob);
            const audio = new Audio(url);
            audio.volume = 1.0;
            audio.play().then(() => {
              console.log('✅ Голос запущен (HTML5 Audio)');
            }).catch(err => {
              console.error('❌ Ошибка воспроизведения голоса:', err);
            });
            // Очищаем URL после воспроизведения
            audio.onended = () => URL.revokeObjectURL(url);
          } catch (error) {
            console.error('❌ Ошибка создания audio blob:', error);
          }
        } else {
          // Desktop - используем Web Audio API
          const audioBytes = ai.decodeBase64(greeting.audioBase64);
          const audioBuffer = await ai.decodeAudioData(audioBytes, ctx);
          const source = ctx.createBufferSource();
          source.buffer = audioBuffer;
          
          // Увеличиваем громкость голоса
          const voiceGain = ctx.createGain();
          voiceGain.gain.setValueAtTime(1.5, ctx.currentTime); // Голос громче (150%)
          source.connect(voiceGain);
          voiceGain.connect(ctx.destination);
          
          source.start();
          console.log('✅ Голос запущен (Web Audio API)');
        }
      } else {
        console.warn('⚠️ Нет аудио данных для воспроизведения');
      }

      setAudioTrigger(true);
      console.log('🎬 AudioTrigger установлен в true');
    } catch (error) {
      console.error('❌ Ошибка воспроизведения звука:', error);
      // Показываем текст даже если звук не работает
      setAudioTrigger(true);
    }
  }, [greeting, audioTrigger]);

  return (
    <div className="relative h-screen w-full flex flex-col items-center justify-center p-4 py-6 md:py-8 overflow-y-auto">
      <Snowfall />

      <div className="fixed top-0 left-0 w-full h-full bg-gradient-to-b from-[#0c1421] via-[#1a2b4a] to-[#0c1421] -z-10"></div>

      <main className="z-10 w-full max-w-4xl flex flex-col items-center justify-center my-auto">
        {state === AppState.IDLE && (
          <div className="my-auto text-center animate-fade-in space-y-4 md:space-y-8 bg-white/5 backdrop-blur-lg p-6 md:p-10 rounded-3xl border border-white/10 shadow-2xl transition-all hover:bg-white/10">
            <h1 className="text-4xl md:text-7xl font-elegant text-yellow-500 mb-2 md:mb-4 drop-shadow-[0_2px_10px_rgba(234,179,8,0.5)]">
              Новогоднее Волшебство 2026
            </h1>
            <p className="text-base md:text-xl text-blue-100 font-light max-w-md mx-auto px-4">
              Получите персональное новогоднее поздравление.
            </p>

            <form
              onSubmit={startCelebration}
              className="flex flex-col gap-4 md:gap-6 items-center w-full"
            >
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Как вас зовут?"
                className="w-full max-w-sm px-6 md:px-8 py-3 md:py-5 rounded-full bg-white/10 border-2 border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-yellow-500 text-lg md:text-2xl text-center transition-all shadow-inner"
                required
              />
              <button
                type="submit"
                className="w-full max-w-sm px-8 md:px-12 py-3 md:py-5 bg-[#c41e3a] hover:bg-[#e62e4d] text-white rounded-full font-bold text-lg md:text-2xl shadow-[0_10px_20px_-5px_rgba(196,30,58,0.5)] transform transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2 md:gap-3"
              >
                Создать открытку ✨
              </button>
            </form>
          </div>
        )}

        {state === AppState.LOADING && (
          <LoadingAnimation />
        )}

        {state === AppState.CELEBRATING && greeting && (
          <div className="w-full flex flex-col items-center space-y-8">
            {!audioTrigger ? (
              <div className="my-auto text-center max-w-lg mx-auto animate-fade-in">
                {/* Праздничный контейнер */}
                <div className="relative bg-gradient-to-br from-white/10 via-white/5 to-white/10 backdrop-blur-xl p-8 md:p-12 rounded-3xl border-2 border-white/20 shadow-2xl overflow-hidden">
                  {/* Блики и эффекты */}
                  <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
                    {/* Угловые декоративные элементы */}
                    <div className="absolute top-4 left-4 text-yellow-400 text-2xl animate-pulse">✨</div>
                    <div className="absolute top-4 right-4 text-red-400 text-2xl animate-pulse" style={{ animationDelay: '0.5s' }}>🎄</div>
                    <div className="absolute bottom-4 left-4 text-green-400 text-2xl animate-pulse" style={{ animationDelay: '1s' }}>⛄</div>
                    <div className="absolute bottom-4 right-4 text-yellow-400 text-2xl animate-pulse" style={{ animationDelay: '0.3s' }}>⭐</div>
                    
                    {/* Падающие снежинки */}
                    {[...Array(6)].map((_, i) => (
                      <div
                        key={i}
                        className="absolute text-white/40 text-sm"
                        style={{
                          left: `${20 + i * 15}%`,
                          animation: `drift ${4 + Math.random() * 2}s linear infinite`,
                          animationDelay: `${i * 0.5}s`,
                        }}
                      >
                        ❄
                      </div>
                    ))}
                  </div>

                  {/* Основной контент */}
                  <div className="relative z-10 space-y-6">
                    {/* Иконка успеха */}
                    <div className="flex justify-center">
                      <div className="text-7xl animate-bounce">
                        🎁
                      </div>
                    </div>

                    {/* Заголовок */}
                    <h2 className="text-3xl md:text-4xl font-elegant text-yellow-400 drop-shadow-[0_2px_10px_rgba(234,179,8,0.8)] mb-2">
                      Ваше поздравление готово!
                    </h2>
                    
                    {/* Подзаголовок */}
                    <p className="text-base md:text-lg text-blue-100/80 font-light max-w-sm mx-auto">
                      Нажмите кнопку чтобы увидеть волшебство ✨
                    </p>

                    {/* Кнопка с эффектами */}
                    <div className="pt-4">
                      <button
                        onClick={handleStartMagic}
                        className="relative px-10 md:px-12 py-4 md:py-5 bg-gradient-to-r from-yellow-500 to-yellow-400 hover:from-yellow-400 hover:to-yellow-300 text-[#0c0f1a] rounded-full font-black text-xl md:text-2xl shadow-[0_10px_40px_rgba(234,179,8,0.6)] transform transition-all hover:scale-110 active:scale-95 inline-flex items-center justify-center gap-3 animate-pulse hover:animate-none"
                      >
                        {/* Светящийся эффект */}
                        <div className="absolute inset-0 rounded-full bg-yellow-300/30 blur-xl"></div>
                        <span className="relative">Открыть</span>
                        <span className="relative text-2xl">🪄</span>
                      </button>
                    </div>

                    {/* Дополнительный декор */}
                    <div className="flex justify-center gap-3 pt-4 opacity-60">
                      <span className="text-2xl animate-bounce" style={{ animationDelay: '0s' }}>🌟</span>
                      <span className="text-2xl animate-bounce" style={{ animationDelay: '0.2s' }}>✨</span>
                      <span className="text-2xl animate-bounce" style={{ animationDelay: '0.4s' }}>🎉</span>
                      <span className="text-2xl animate-bounce" style={{ animationDelay: '0.6s' }}>✨</span>
                      <span className="text-2xl animate-bounce" style={{ animationDelay: '0.8s' }}>🌟</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="w-full flex flex-col items-center animate-scale-up">
                <Postcard
                  text={greeting.text}
                  duration={greeting.duration}
                  startTrigger={audioTrigger}
                  onFinished={() => console.log("Finished typing")}
                />

                <button
                  onClick={() => {
                    backgroundMusicActiveRef.current = false;
                    if (backgroundSourceRef.current)
                      backgroundSourceRef.current.stop();
                    window.location.reload();
                  }}
                  className="mt-12 px-8 py-3 bg-white/10 hover:bg-white/20 text-white rounded-full border border-white/20 transition-all font-light"
                >
                  Создать новое чудо 🔄
                </button>
              </div>
            )}
          </div>
        )}

        {state === AppState.ERROR && (
          <div className="my-auto text-center space-y-4 bg-red-900/20 p-8 rounded-2xl border border-red-500/30">
            <h2 className="text-3xl text-red-400 font-bold">
              Ой! Снежинки запутались.
            </h2>
            <p className="text-white opacity-80">
              Не удалось связаться с северным полюсом Gemini. Пожалуйста,
              попробуйте еще раз.
            </p>
            <button
              onClick={() => setState(AppState.IDLE)}
              className="px-8 py-2 bg-white/10 rounded-full text-white hover:bg-white/20 transition-all"
            >
              Вернуться назад
            </button>
          </div>
        )}
      </main>

      <div className="fixed top-0 left-0 w-full flex justify-around pointer-events-none z-50">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className={`w-3 h-3 rounded-full shadow-[0_0_15px_rgba(255,255,255,0.8)] animate-pulse`}
            style={{
              backgroundColor:
                i % 3 === 0 ? "#c41e3a" : i % 3 === 1 ? "#22c55e" : "#eab308",
              animationDelay: `${i * 0.3}s`,
              marginTop: i % 2 === 0 ? "5px" : "15px",
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default App;
