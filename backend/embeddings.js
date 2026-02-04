import axios from "axios";
import "dotenv/config";

const baseURL = process.env.OPENAI_BASE_URL;
const apiKey = process.env.OPENAI_API_KEY;
const embeddingModel = process.env.EMBEDDING_MODEL;
const llmModel = process.env.LLM_MODEL;

export async function embedText(text) {
  const res = await axios.post(
    `${baseURL}/embeddings`,
    { model: embeddingModel, input: text },
    { headers: { Authorization: `Bearer ${apiKey}` } }
  );
  return res.data.data[0].embedding;
}

export async function chatWithContext(question, context) {
  const prompt = `You are a helpful assistant answering questions about college circulars and notices.

Context from circulars:
${context}

Question: ${question}

Provide a concise, clear answer based only on the provided context. If the context doesn't contain relevant information, say so.`;

  const res = await axios.post(
    `${baseURL}/chat/completions`,
    {
      model: llmModel,
      messages: [
        { role: "system", content: "You answer questions based on college circulars. Be concise." },
        { role: "user", content: prompt }
      ],
      temperature: 0.7
    },
    { headers: { Authorization: `Bearer ${apiKey}` } }
  );

  return res.data.choices[0].message.content.trim();
}
