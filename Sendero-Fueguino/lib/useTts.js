'use client';

import { useCallback, useEffect, useState } from 'react';

export function useTts() {
  const [soportado, setSoportado] = useState(false);
  const [hablando, setHablando] = useState(false);

  useEffect(() => {
    setSoportado(typeof window !== 'undefined' && 'speechSynthesis' in window);
  }, []);

  const hablar = useCallback((texto, idioma) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(texto);
    utter.lang = idioma === 'en' ? 'en-US' : idioma === 'pt' ? 'pt-BR' : 'es-AR';
    utter.rate = 0.95;
    utter.onend = () => setHablando(false);
    utter.onerror = () => setHablando(false);
    setHablando(true);
    window.speechSynthesis.speak(utter);
  }, []);

  const pausar = useCallback(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    setHablando(false);
  }, []);

  return { soportado, hablando, hablar, pausar };
}
