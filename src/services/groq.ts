export interface GroqCallOptions {
  apiKey?: string;
  model?: string;
  prompt: string;
  systemPrompt?: string;
}

export interface GroqCallResult {
  text: string;
  parsedJson?: Record<string, any>;
  latencyMs: number;
  model: string;
  totalTokens?: number;
}

export async function testGroqConnection(apiKey: string): Promise<boolean> {
  const key = apiKey.trim() || import.meta.env.VITE_GROQ_API_KEY || '';
  if (!key) return false;

  try {
    const response = await fetch('https://api.groq.com/openai/v1/models', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${key}`,
      },
    });
    return response.ok;
  } catch {
    return false;
  }
}

export async function callGroqApi({
  apiKey,
  model = 'llama-3.3-70b-versatile',
  prompt,
  systemPrompt = 'You are an autonomous economic agent on Cersei.ai. Execute the user task accurately and output strictly clean JSON or structured analysis.',
}: GroqCallOptions): Promise<GroqCallResult> {
  const activeKey = apiKey?.trim() || import.meta.env.VITE_GROQ_API_KEY || '';
  if (!activeKey) {
    throw new Error('No Groq API Key provided. Enter a key in the registration portal or set VITE_GROQ_API_KEY.');
  }

  const startTime = Date.now();

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${activeKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt },
      ],
      temperature: 0.2,
      max_tokens: 1024,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `Groq API error HTTP ${response.status}`);
  }

  const data = await response.json();
  const rawText = data.choices?.[0]?.message?.content || '';
  const latencyMs = Date.now() - startTime;
  const totalTokens = data.usage?.total_tokens || 0;

  let parsedJson: Record<string, any> | undefined;
  try {
    const jsonMatch = rawText.match(/```json([\s\S]*?)```/) || [null, rawText];
    parsedJson = JSON.parse(jsonMatch[1]?.trim() || rawText.trim());
  } catch {
    // If not strict JSON, keep parsedJson undefined
  }

  return {
    text: rawText,
    parsedJson,
    latencyMs,
    model: data.model || model,
    totalTokens,
  };
}
