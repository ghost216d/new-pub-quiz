interface Env {
  GEMINI_API_KEY: string;
  GEMINI_MODEL?: string;
  ALLOWED_ORIGIN?: string;
}

const json = (body: unknown, status = 200, origin = '*') => new Response(JSON.stringify(body), {
  status,
  headers: {
    'content-type': 'application/json; charset=utf-8',
    'access-control-allow-origin': origin,
    'access-control-allow-headers': 'content-type',
    'access-control-allow-methods': 'POST, OPTIONS',
    'cache-control': 'no-store',
    'x-content-type-options': 'nosniff',
  },
});

const normalize = (value: unknown) => String(value || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const allowedOrigin = env.ALLOWED_ORIGIN || 'https://ghost216d.github.io';
    const origin = request.headers.get('origin') || '';

    if (request.method === 'OPTIONS') {
      return origin === allowedOrigin ? json({}, 204, allowedOrigin) : json({ error: 'Origin not allowed.' }, 403);
    }
    if (request.method !== 'POST' || new URL(request.url).pathname !== '/questions') {
      return json({ error: 'Not found.' }, 404, allowedOrigin);
    }
    if (origin !== allowedOrigin) return json({ error: 'Origin not allowed.' }, 403, allowedOrigin);
    if (!env.GEMINI_API_KEY) return json({ error: 'Question service is not configured.' }, 503, allowedOrigin);

    let input: { category?: string; count?: number; difficulty?: string; seen?: string[] };
    try {
      input = await request.json();
    } catch {
      return json({ error: 'Invalid JSON.' }, 400, allowedOrigin);
    }

    const count = Math.max(1, Math.min(10, Number(input.count) || 5));
    const category = String(input.category || 'General Knowledge').slice(0, 120);
    const difficulty = ['easy', 'medium', 'hard', 'expert'].includes(String(input.difficulty))
      ? String(input.difficulty)
      : 'medium';
    const seen = Array.isArray(input.seen)
      ? input.seen.map(normalize).filter(Boolean).slice(-1500)
      : [];

    const prompt = `Create ${count} original British pub-quiz multiple-choice questions.
Topic: ${category}
Difficulty: ${difficulty}
Return JSON only as an array. Each item needs: prompt, category, exactly four distinct options, correctAnswer matching one option exactly, acceptableAnswers, explanation, points, timeLimitSec, type="multiple_choice", difficulty.
Do not repeat, paraphrase, or closely resemble any question in this previously-used list:\n${seen.join('\n')}`;

    const model = env.GEMINI_MODEL || 'gemini-2.5-flash';
    const apiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(env.GEMINI_API_KEY)}`,
      {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: 'application/json', temperature: 1.15 },
        }),
      },
    );

    if (!apiResponse.ok) return json({ error: 'Question generation failed.' }, 502, allowedOrigin);
    const result = await apiResponse.json() as any;
    const text = result?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) return json({ error: 'Question generation returned no content.' }, 502, allowedOrigin);

    try {
      const questions = JSON.parse(text);
      const seenSet = new Set(seen);
      const unique = Array.isArray(questions)
        ? questions.filter((question, index, all) => {
            const key = normalize(question?.prompt);
            return key && !seenSet.has(key) && all.findIndex((item) => normalize(item?.prompt) === key) === index;
          }).slice(0, count)
        : [];
      if (unique.length < count) return json({ error: 'Not enough unique questions were generated.' }, 409, allowedOrigin);
      return json({ questions: unique }, 200, allowedOrigin);
    } catch {
      return json({ error: 'Question generation returned invalid JSON.' }, 502, allowedOrigin);
    }
  },
};
