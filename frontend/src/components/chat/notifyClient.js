// Browser-side alerting: OS desktop notifications plus a short WebAudio chime.
// Preferences live in localStorage so they are per-device and work without a
// backend round-trip; the server-side preference screen keeps the account-level
// channel switches.

const KEY_DESKTOP = 'chat.desktopNotifications';
const KEY_SOUND = 'chat.notificationSound';

export const getNotifyPrefs = () => ({
  desktop: localStorage.getItem(KEY_DESKTOP) !== '0',
  sound: localStorage.getItem(KEY_SOUND) !== '0'
});

export const setNotifyPref = (key, value) => {
  const storeKey = key === 'desktop' ? KEY_DESKTOP : KEY_SOUND;
  localStorage.setItem(storeKey, value ? '1' : '0');
};

export const ensureNotificationPermission = async () => {
  if (typeof Notification === 'undefined') return 'unsupported';
  if (Notification.permission === 'granted' || Notification.permission === 'denied') return Notification.permission;
  try {
    return await Notification.requestPermission();
  } catch {
    return 'default';
  }
};

let audioCtx = null;
export const playPing = () => {
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return;
    audioCtx = audioCtx || new Ctx();
    const now = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, now);
    osc.frequency.exponentialRampToValueAtTime(1320, now + 0.12);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.18, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.28);
    osc.connect(gain).connect(audioCtx.destination);
    osc.start(now);
    osc.stop(now + 0.3);
  } catch {
    /* audio is best-effort */
  }
};

export const showDesktopNotification = (title, body, onClick) => {
  try {
    if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return;
    const n = new Notification(title || 'New message', { body: body || '', tag: 'essa-chat', renotify: true });
    n.onclick = () => {
      window.focus();
      n.close();
      onClick && onClick();
    };
  } catch {
    /* ignore */
  }
};

// `shouldAlert` is decided by the caller (tab hidden or a different thread).
export const alertIncoming = ({ title, body, shouldAlert, onClick }) => {
  if (!shouldAlert) return;
  const prefs = getNotifyPrefs();
  if (prefs.sound) playPing();
  if (prefs.desktop) showDesktopNotification(title, body, onClick);
};