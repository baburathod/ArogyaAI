const API_URL = 'https://api.anthropic.com/v1/messages';
const MODEL = 'claude-sonnet-4-20250514';
export async function requestDiagnosis(payload) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
        throw new Error('Missing Anthropic API key');
    }
    const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
            model: MODEL,
            max_tokens: 1000,
            messages: [
                {
                    role: 'user',
                    content: `Rural healthcare diagnostic assistant. Patient symptoms: "${payload.symptoms}". Severity: ${payload.severity}/10. Duration: ${payload.duration}. Return only valid JSON for {"condition":"","severity":"low|medium|high","description":"","why":"","advice":[],"isEmergency":false,"confidence":80}`
                }
            ]
        })
    });
    const data = await response.json();
    const text = data.content?.[0]?.text ?? '';
    const cleaned = text.replace(/```json|```/g, '').trim();
    try {
        return JSON.parse(cleaned);
    }
    catch (error) {
        throw new Error('Invalid AI response format');
    }
}
