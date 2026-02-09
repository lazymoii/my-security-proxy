// Rate Limiting을 위한 아주 간단한 메모리 저장소 (Vercel 인스턴스 생존 시간 동안 유지)
const requestLogs = new Map(); 

export default async function handler(req, res) {
  // 1. [Phase 1] 커스텀 헤더 가드: 우리 앱만 아는 암호 확인
  const appSecret = req.headers['x-app-secret'];
  const VALID_SECRET = "tokyo-tasty-2026-secret"; // 안드로이드 앱과 똑같이 맞춰야 함

  // 2. [Phase 2] 심플 Rate Limiting: 동일 IP 5초 이내 재요청 차단
  const userIP = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  const now = Date.now();
  
  if (requestLogs.has(userIP)) {
    const lastRequestTime = requestLogs.get(userIP);
    if (now - lastRequestTime < 5000) { // 5초 제한
      return res.status(429).json({ 
        error: "Too Many Requests", 
        message: "보안 정책상 5초에 한 번만 질문할 수 있습니다. 천천히 해주세요!" 
      });
    }
  }
  requestLogs.set(userIP, now);

  // 3. 브라우저 접속(GET) 및 기본 메시지 체크
  const message = req.body && req.body.message;

  if (req.method !== 'POST' || !message) {
    return res.status(200).json({
      status: "alive",
      info: "보안 가드가 활성화된 상태입니다. 올바른 헤더와 메시지를 POST로 보내세요.",
      guard: "Active"
    });
  }

  // 4. 가드 체크: 헤더 암호가 틀리면 바로 입구컷
  if (appSecret !== VALID_SECRET) {
    console.log(`[Security Alert] 비정상 접근 차단: IP ${userIP}`);
    return res.status(403).json({ error: "Forbidden: 인증되지 않은 요청입니다." });
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
        model: "llama-3.3-70b-versatile", // 모델명 고정!
        messages: [{ role: "user", content: message }]
      }),
    });

    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
