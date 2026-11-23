/**
 * API Service Layer for URL Safety Checker
 * Supports both local development and production cloud deployment (Render, Vercel, Netlify).
 */

const API_BASE = import.meta.env.VITE_API_URL 
  ? `${import.meta.env.VITE_API_URL.replace(/\/$/, '')}/api`
  : (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? 'http://localhost:5000/api'
    : '/api';

export async function analyzeUrl(url) {
  try {
    const res = await fetch(`${API_BASE}/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ url })
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to analyze URL');
    }
    return data;
  } catch (err) {
    console.warn('[API] Backend call failed, using client fallback engine:', err.message);
    throw err;
  }
}

export async function getHistory(params = {}) {
  try {
    const query = new URLSearchParams();
    if (params.riskLevel) query.append('riskLevel', params.riskLevel);
    if (params.search) query.append('search', params.search);
    if (params.page) query.append('page', params.page);
    if (params.limit) query.append('limit', params.limit);

    const res = await fetch(`${API_BASE}/history?${query.toString()}`);
    const data = await res.json();
    return data;
  } catch (err) {
    console.error('[API] Failed to fetch history:', err);
    return { success: false, data: [], meta: { total: 0 } };
  }
}

export async function getStats() {
  try {
    const res = await fetch(`${API_BASE}/stats`);
    const data = await res.json();
    return data;
  } catch (err) {
    console.error('[API] Failed to fetch stats:', err);
    return {
      success: false,
      data: {
        total: 0,
        safeCount: 0,
        mediumCount: 0,
        highCount: 0,
        recent: [],
        dbStatus: 'OFFLINE'
      }
    };
  }
}

export async function getDfaModel() {
  try {
    const res = await fetch(`${API_BASE}/dfa-model`);
    const data = await res.json();
    return data;
  } catch (err) {
    console.error('[API] Failed to fetch DFA model:', err);
    return null;
  }
}

export async function deleteHistoryItem(id) {
  const res = await fetch(`${API_BASE}/history/${id}`, {
    method: 'DELETE'
  });
  return await res.json();
}

export async function clearAllHistory() {
  const res = await fetch(`${API_BASE}/history`, {
    method: 'DELETE'
  });
  return await res.json();
}

export async function checkBackendHealth() {
  try {
    const res = await fetch(`${API_BASE}/health`, { signal: AbortSignal.timeout(2500) });
    return await res.json();
  } catch (err) {
    return { status: 'offline', error: err.message };
  }
}
