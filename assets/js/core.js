/* Small independent suite core: translation, guarded local storage, optional game sounds. */
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
  const sound = {
    enabled: false,
    context: null,
    active: new Set(),
    stop() { for (const node of this.active) { try { node.stop(); } catch (_) {} } this.active.clear(); },
    async play(kind = 'move') {
      if (!this.enabled || document.hidden) return;
      try {
        const Audio = window.AudioContext || window.webkitAudioContext;
        if (!Audio) return;
        this.context ||= new Audio();
        if (this.context.state === 'suspended') await this.context.resume();
        if (!this.enabled || document.hidden) return;
        this.stop();
        const now = this.context.currentTime;
        const notes = kind === 'success' ? [523.25, 659.25] : [330];
        notes.forEach((hz, i) => {
          const oscillator = this.context.createOscillator(), gain = this.context.createGain();
          const begin = now + i * 0.09;
          oscillator.type = 'sine'; oscillator.frequency.value = hz;
          gain.gain.setValueAtTime(0, begin); gain.gain.linearRampToValueAtTime(0.07, begin + 0.012);
          gain.gain.exponentialRampToValueAtTime(0.001, begin + 0.09);
          oscillator.connect(gain); gain.connect(this.context.destination);
          this.active.add(oscillator);
          oscillator.onended = () => { this.active.delete(oscillator); oscillator.disconnect(); gain.disconnect(); };
          oscillator.start(begin); oscillator.stop(begin + 0.1);
        });
      } catch (_) { /* Sound is optional; a blocked audio device never prevents play. */ }
    }
  };
  window.App = { STORAGE_PREFIX, i18n, storage, sound };
}());
