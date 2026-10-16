export const resolveQuizAssetUrl = (assetPath: string, baseUrl = import.meta.env.BASE_URL): string => {
  const source = String(assetPath || '').trim();
  if (!source || /^(?:https?:|data:|blob:)/i.test(source)) return source;
  const base = String(baseUrl || '/').replace(/\/*$/, '/');
  return `${base}${source.replace(/^\/+/, '')}`;
};
