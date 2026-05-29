const DEEPSEEK_API_URL = "https://api.deepseek.com/v1/chat/completions";

export async function generateSummary(
  title: string,
  apiKey: string
): Promise<string> {
  const response = await fetch(DEEPSEEK_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "deepseek-chat",
      messages: [
        {
          role: "system",
          content:
            "你是一位科技资讯编辑。请用简洁的中文（约100字）概括以下英文文章标题和来源的核心内容。只输出摘要，不要添加额外说明。",
        },
        {
          role: "user",
          content: `标题: ${title}`,
        },
      ],
      max_tokens: 200,
      temperature: 0.3,
    }),
  });

  if (!response.ok) {
    throw new Error(
      `DeepSeek API error: ${response.status} ${response.statusText}`
    );
  }

  const data = await response.json();
  return data.choices[0].message.content.trim();
}
