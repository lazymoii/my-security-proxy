export default async function handler(req, res) {
 // (가장 단순한 메모리 방식 - Vercel 서버가 재시작되면 초기화되지만 기본 방어는 됨)
const requestCounts = new Map();

export default async function handler(req, res) {
    const userIP = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const now = Date.now();
    
    if (requestCounts.has(userIP)) {
        const lastRequest = requestCounts.get(userIP);
        if (now - lastRequest < 5000) { // 5초 이내 재요청 시 차단
            return res.status(429).json({ error: "Too many requests. 천천히 좀 하세요!" });
        }
    }
    requestCounts.set(userIP, now);
    // ...
}

  const API_KEY = process.env.GROQ_API_KEY;

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: message }]
      }),
    });

    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
