/* Small independent suite core: translation, guarded local storage, local voice. */
(function () {
  'use strict';
  const STORAGE_PREFIX = 'enroca:';
  const dictionaries = {};
  let locale = 'es';
  const storage = {
    available: true,
    read(key, fallback) {
      try { const value = localStorage.getItem(STORAGE_PREFIX + key); return value === null ? fallback : JSON.parse(value); }
      catch (_) { return fallback; }
    },
    write(key, value) {
      try { localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value)); return true; }
      catch (_) { this.available = false; return false; }
    },
    reset() {
      try {
        Object.keys(localStorage).filter(k => k.startsWith(STORAGE_PREFIX)).forEach(k => localStorage.removeItem(k));
        return true;
      } catch (_) { this.available = false; return false; }
    }
  };
  const i18n = {
    register(lang, strings) { dictionaries[lang] = strings; },
    set(lang) { locale = lang === 'en' ? 'en' : 'es'; document.documentElement.lang = locale; },
    get locale() { return locale; },
    t(key, params = {}) {
      const source = (dictionaries[locale] || {})[key] || (dictionaries.es || {})[key] || key;
      return source.replace(/\{(\w+)\}/g, (_, k) => params[k] === undefined ? '{' + k + '}' : String(params[k]));
    }
  };
  const tts = {
    speaking: false,
    stop() { if ('speechSynthesis' in window) window.speechSynthesis.cancel(); this.speaking = false; },
    speak(text, onEnd) {
      this.stop();
      if (!('speechSynthesis' in window)) return false;
      // Never fall back to a remote voice: the suite has no runtime third parties.
      const voice = window.speechSynthesis.getVoices().find(v => v.localService && v.lang.toLowerCase().startsWith(locale));
      if (!voice) return false;
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.voice = voice; utterance.lang = voice.lang; utterance.rate = 0.85;
      utterance.onend = utterance.onerror = () => { this.speaking = false; if (onEnd) onEnd(); };
      this.speaking = true; window.speechSynthesis.speak(utterance); return true;
    }
  };
  window.App = { STORAGE_PREFIX, i18n, storage, tts };
}());
