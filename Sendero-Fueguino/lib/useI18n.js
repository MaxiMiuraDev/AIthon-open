'use client';

import { useEffect, useState, useCallback } from 'react';

function deepMerge(base, override) {
  const out = Array.isArray(base) ? base.slice() : { ...base };
  for (const key in override) {
    if (
      override[key] && typeof override[key] === 'object' && !Array.isArray(override[key]) &&
      base[key] && typeof base[key] === 'object' && !Array.isArray(base[key])
    ) {
      out[key] = deepMerge(base[key], override[key]);
    } else {
      out[key] = override[key];
    }
  }
  return out;
}

export function useI18n(idioma) {
  const [dict, setDict] = useState(null);

  useEffect(() => {
    let cancelado = false;
    async function cargar() {
      const resEs = await fetch('/data/i18n/es.json').then((r) => r.json());
      if (!idioma || idioma === 'es') {
        if (!cancelado) setDict(resEs);
        return;
      }
      try {
        const resOtro = await fetch(`/data/i18n/${idioma}.json`).then((r) => r.json());
        if (!cancelado) setDict(deepMerge(resEs, resOtro));
      } catch (e) {
        if (!cancelado) setDict(resEs);
      }
    }
    cargar();
    return () => { cancelado = true; };
  }, [idioma]);

  const t = useCallback((path, fallback) => {
    if (!dict) return fallback ?? path;
    const parts = path.split('.');
    let cur = dict;
    for (const p of parts) {
      if (cur && typeof cur === 'object' && p in cur) {
        cur = cur[p];
      } else {
        return fallback ?? path;
      }
    }
    return cur;
  }, [dict]);

  return { dict, t, listo: !!dict };
}
