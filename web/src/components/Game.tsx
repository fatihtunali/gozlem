'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  createSession,
  getNextPrompt,
  submitChoice,
  getRevelation,
  Session,
  Prompt,
  ChoiceResult,
  Revelation,
} from '@/lib/api';

type GamePhase = 'loading' | 'playing' | 'feedback' | 'revelation';

export default function Game() {
  const [phase, setPhase] = useState<GamePhase>('loading');
  const [session, setSession] = useState<Session | null>(null);
  const [prompt, setPrompt] = useState<Prompt | null>(null);
  const [lastResult, setLastResult] = useState<ChoiceResult | null>(null);
  const [revelation, setRevelation] = useState<Revelation | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Initialize session
  const initGame = useCallback(async () => {
    try {
      setPhase('loading');
      setError(null);
      const newSession = await createSession();
      setSession(newSession);
      const newPrompt = await getNextPrompt(newSession.id);
      setPrompt(newPrompt);
      setPhase('playing');
    } catch (err) {
      setError('Oyun başlatılamadı. Lütfen tekrar deneyin.');
      console.error(err);
    }
  }, []);

  useEffect(() => {
    initGame();
  }, [initGame]);

  // Handle choice selection
  const handleChoice = async (choiceId: string) => {
    if (!session || !prompt) return;

    try {
      setPhase('loading');
      const result = await submitChoice(session.id, prompt.id, choiceId);
      setLastResult(result);
      setSession((prev) => prev ? { ...prev, state: result.state } : null);

      // Check for milestone
      if (result.milestoneTriggered) {
        const rev = await getRevelation(session.id);
        if (rev) {
          setRevelation(rev);
          setPhase('revelation');
          return;
        }
      }

      setPhase('feedback');
    } catch (err) {
      setError('Seçim gönderilemedi. Lütfen tekrar deneyin.');
      setPhase('playing');
      console.error(err);
    }
  };

  // Continue to next prompt
  const handleContinue = async () => {
    if (!session) return;

    try {
      setPhase('loading');
      const newPrompt = await getNextPrompt(session.id);
      setPrompt(newPrompt);
      setLastResult(null);
      setPhase('playing');
    } catch (err) {
      setError('Sonraki soru yüklenemedi.');
      console.error(err);
    }
  };

  // Continue after revelation
  const handleContinueAfterRevelation = async () => {
    setRevelation(null);
    await handleContinue();
  };

  // Restart game
  const handleRestart = () => {
    setSession(null);
    setPrompt(null);
    setLastResult(null);
    setRevelation(null);
    initGame();
  };

  // Loading state
  if (phase === 'loading' && !prompt) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Sistem hazırlanıyor...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={handleRestart}
            className="px-6 py-2 bg-white text-black rounded hover:bg-gray-200 transition"
          >
            Tekrar Dene
          </button>
        </div>
      </div>
    );
  }

  // Revelation state
  if (phase === 'revelation' && revelation) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
        <div className="max-w-lg w-full">
          <div className="text-center mb-8">
            <p className="text-gray-500 text-sm mb-2">KAYIT ÖZETİ</p>
            <h1 className="text-2xl font-light">Sistem seni gözlemledi.</h1>
          </div>

          <div className="space-y-4 mb-8">
            {revelation.observations.map((obs, i) => (
              <div
                key={obs.key}
                className="p-4 border border-gray-800 rounded"
                style={{ animationDelay: `${i * 0.2}s` }}
              >
                <p className="text-gray-300">{obs.text}</p>
                <div className="mt-2 h-1 bg-gray-800 rounded overflow-hidden">
                  <div
                    className="h-full bg-white transition-all duration-1000"
                    style={{ width: `${obs.confidence * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {revelation.comparison && (
            <div className="text-center mb-8 p-4 bg-gray-900 rounded">
              <p className="text-gray-400">{revelation.comparison.text}</p>
            </div>
          )}

          <div className="text-center mb-8">
            <p className="text-gray-500 text-sm">
              Sistemin tahmin doğruluğu: %{Math.round(revelation.systemAccuracy * 100)}
            </p>
          </div>

          <button
            onClick={handleContinueAfterRevelation}
            className="w-full py-3 bg-white text-black rounded hover:bg-gray-200 transition"
          >
            Devam Et
          </button>
        </div>
      </div>
    );
  }

  // Feedback state
  if (phase === 'feedback' && lastResult) {
    const toneColors = {
      neutral: 'text-gray-300',
      curious: 'text-blue-300',
      unsettling: 'text-amber-300',
    };

    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <p className={`text-xl mb-6 ${toneColors[lastResult.feedback.tone]}`}>
            {lastResult.feedback.text}
          </p>

          {lastResult.feedback.socialHint && (
            <p className="text-gray-500 text-sm mb-6">
              {lastResult.feedback.socialHint}
            </p>
          )}

          {lastResult.feedback.flags.patternDetected && (
            <p className="text-amber-500 text-xs mb-6">
              ● Kalıp tespit edildi
            </p>
          )}

          <div className="flex justify-between text-gray-600 text-sm mb-8">
            <span>Adım: {lastResult.state.step}</span>
            <span>Seri: {lastResult.state.streak.sameChoice}</span>
          </div>

          <button
            onClick={handleContinue}
            className="w-full py-3 border border-gray-700 rounded hover:border-white transition"
          >
            Devam
          </button>
        </div>
      </div>
    );
  }

  // Playing state
  if (phase === 'playing' && prompt) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="text-center mb-2">
            <span className="text-gray-600 text-xs uppercase tracking-wider">
              {prompt.category}
            </span>
          </div>

          <h2 className="text-2xl text-center mb-12 font-light">
            {prompt.text}
          </h2>

          <div className="space-y-3">
            {prompt.choices.map((choice) => (
              <button
                key={choice.id}
                onClick={() => handleChoice(choice.id)}
                className="w-full py-4 border border-gray-700 rounded text-left px-6 hover:border-white hover:bg-gray-900 transition disabled:opacity-50"
              >
                {choice.label}
              </button>
            ))}
          </div>

          <div className="mt-8 text-center text-gray-600 text-sm">
            Adım {(session?.state.step ?? 0) + 1}
          </div>
        </div>
      </div>
    );
  }

  return null;
}
