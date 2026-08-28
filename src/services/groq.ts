export interface GroqCallOptions {
  apiKey: string;
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
  try {
    const response = await fetch('https://api.groq.com/openai/v1/models', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${apiKey.trim()}`,
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
  const startTime = Date.now();

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey.trim()}`,
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
    // Attempt parsing if JSON is returned
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
