export async function generateSummary(content: string): Promise<string> {
  const apiKey = process.env.GOOGLE_AI_API_KEY!
  const prompt = `Summarize the following blog article in approximately 200 words. Focus on key points, main arguments, and conclusions. Write in clear prose.\n\n${content}`

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key=${apiKey}`

  const body = JSON.stringify({
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: { maxOutputTokens: 350, temperature: 0.4 },
  })

  // Retry up to 3 times with increasing delay for rate limits
  for (let attempt = 1; attempt <= 3; attempt++) {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
    })

    if (res.status === 429) {
      if (attempt < 3) {
        const wait = attempt * 20000 // 20s, then 40s
        console.log(`[Gemini] Rate limited. Waiting ${wait/1000}s before retry ${attempt+1}/3...`)
        await new Promise(r => setTimeout(r, wait))
        continue
      }
      throw new Error('Rate limit reached. Please wait a minute and try again.')
    }

    if (!res.ok) {
      const e = await res.json().catch(() => ({}))
      throw new Error(e?.error?.message ?? `HTTP ${res.status}`)
    }

    const data = await res.json()
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text
    if (!text) throw new Error('Empty response from Gemini')

    console.log(`[Gemini] ✅ Summary generated (attempt ${attempt})`)
    return text
  }

  throw new Error('Failed after 3 attempts. Please try again in a minute.')
}