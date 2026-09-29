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
      const soundKind = kind === 'error' ? 'error' : 'success';
      let shared = null;
      try {
        const saved = JSON.parse(localStorage.getItem('miralante:sounds') || 'null');
        if (saved && typeof saved[soundKind] === 'boolean') shared = saved[soundKind];
      } catch (_) {}
      if ((shared === null ? !this.enabled : !shared) || document.hidden) return;
      try {
        const Audio = window.AudioContext || window.webkitAudioContext;
        if (!Audio) return;
        this.context ||= new Audio();
        if (this.context.state === 'suspended') await this.context.resume();
        if (document.hidden) return;
        this.stop();
        const now = this.context.currentTime;
        const success = kind === 'success';
        const error = kind === 'error';
        const notes = success ? [523.25, 659.25] : [error ? 180 : 330];
        notes.forEach((hz, i) => {
          const oscillator = this.context.createOscillator(), gain = this.context.createGain();
          const begin = now + (success ? i * 0.12 : 0);
          const duration = success ? (i === 0 ? 0.15 : 0.2) : (error ? 0.12 : 0.1);
          oscillator.type = error ? 'triangle' : 'sine'; oscillator.frequency.value = hz;
          gain.gain.setValueAtTime(0.12, begin);
          gain.gain.exponentialRampToValueAtTime(0.001, begin + duration);
          oscillator.connect(gain); gain.connect(this.context.destination);
          this.active.add(oscillator);
          oscillator.onended = () => { this.active.delete(oscillator); oscillator.disconnect(); gain.disconnect(); };
          oscillator.start(begin); oscillator.stop(begin + duration);
        });
      } catch (_) { /* Sound is optional; a blocked audio device never prevents play. */ }
    }
  };
  window.App = { STORAGE_PREFIX, i18n, storage, sound };
}());
