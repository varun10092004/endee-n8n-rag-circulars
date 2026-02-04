import axios from "axios";
import "dotenv/config";

const baseURL = process.env.ENDEE_BASE_URL;
const indexName = process.env.ENDEE_INDEX_NAME;

export async function createIndexIfNotExists(dimension = 1536) {
  try {
    await axios.post(`${baseURL}/indices`, {
      name: indexName,
      dimension,
      metric: "cosine",
      metadata_schema: {
        title: "string",
        source: "string"
      }
    });
  } catch (err) {
    if (err.response && err.response.status === 409) return;
    console.error("Error creating index:", err.response?.data || err.message);
    throw err;
  }
}

export async function upsertVectors(vectors) {
  const payload = {
    index: indexName,
    points: vectors.map(v => ({
      id: v.id,
      vector: v.vector,
      metadata: {
        title: v.title,
        source: v.source
      }
    }))
  };
  const res = await axios.post(`${baseURL}/points/upsert`, payload);
  return res.data;
}

export async function searchVectors(queryVector, topK = 5) {
  const payload = {
    index: indexName,
    vector: queryVector,
    top_k: topK
  };
  const res = await axios.post(`${baseURL}/points/search`, payload);
  return res.data.matches || res.data.results || [];
}
