export function trackEvent(event: string, meta: Record<string, unknown> = {}) {
  const token = localStorage.getItem('access_token');
  const payload = {
    event,
    meta,
  };

  // Console + localStorage for debugging
  console.log('[TRACK]', payload);
  const history = JSON.parse(localStorage.getItem('track_history') || '[]');
  history.push({ ...payload, timestamp: new Date().toISOString() });
  localStorage.setItem('track_history', JSON.stringify(history.slice(-50)));

  // 🚀 Send to backend
  if (!token) return;
  fetch('http://localhost:5000/api/analytics', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  }).catch((err) => {
    console.warn('Analytics failed', err);
  });
}
