export default async function handler(req, res) {
  // 1. 가방(body)이 있는지, 그 안에 message가 있는지 미리 확인!
  const message = req.body && req.body.message;

  // 2. 만약 브라우저로 그냥 들어왔거나(GET), 메시지가 없다면 안내문 출력
  if (!message) {
    return res.status(200).json({
      status: "alive",
      info: "서버는 정상입니다. 앱에서 POST 방식으로 message를 보내주세요!",
      hint: "브라우저 접속은 GET 방식이라 req.body가 없습니다."
    });
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
        model: "mixtral-8x7b-32768",
        messages: [{ role: "user", content: message }]
      }),
    });

    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
