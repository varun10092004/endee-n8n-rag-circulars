import express from "express";
import "dotenv/config";
import fs from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";
import { createIndexIfNotExists, upsertVectors, searchVectors } from "./endeeClient.js";
import { embedText, chatWithContext } from "./embeddings.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

const dataDir = path.join(__dirname, "..", "data");

async function ingestCirculars() {
  console.log("Starting ingestion...");
  await createIndexIfNotExists();

  const files = await fs.readdir(dataDir);
  const vectors = [];
  let processedChunks = 0;

  for (const file of files) {
    if (!file.endsWith(".txt")) continue;
    console.log(`Processing file: ${file}`);
    
    const content = await fs.readFile(path.join(dataDir, file), "utf8");
    const chunks = splitIntoChunks(content, 800);

    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      try {
        const embedding = await embedText(chunk);
        vectors.push({
          id: `${file}-${i}`,
          vector: embedding,
          title: file,
          source: `data/${file}`
        });
        processedChunks++;
      } catch (error) {
        console.error(`Error embedding chunk ${i} from ${file}:`, error.message);
      }
    }
  }

  if (vectors.length > 0) {
    console.log(`Upserting ${vectors.length} vectors...`);
    await upsertVectors(vectors);
    console.log("✓ Ingestion complete!");
  }
}

function splitIntoChunks(text, chunkSize = 800, overlap = 200) {
  const words = text.split(/\s+/);
  const chunks = [];
  let start = 0;
  while (start < words.length) {
    const end = Math.min(start + chunkSize, words.length);
    chunks.push(words.slice(start, end).join(" "));
    if (end === words.length) break;
    start = end - overlap;
  }
  return chunks;
}

app.post("/rag-query", async (req, res) => {
  try {
    const { question } = req.body;
    if (!question) {
      return res.status(400).json({ error: "question is required" });
    }

    console.log(`\n[Query] ${question}`);
    
    const qEmbedding = await embedText(question);
    const results = await searchVectors(qEmbedding, 5);

    let contextText = "";
    if (results.length > 0) {
      contextText = results
        .map(r => {
          const metadata = r.metadata || {};
          return `[${metadata.title || 'Unknown'}] ${r.text || ''}`;
        })
        .join("\n\n");
    } else {
      contextText = "No relevant information found in circulars.";
    }

    const answer = await chatWithContext(question, contextText);
    
    res.json({
      answer,
      context_chunks: results.length,
      sources: results.map(r => r.metadata?.source || 'unknown')
    });
  } catch (err) {
    console.error("Error in /rag-query:", err.message);
    res.status(500).json({ error: err.message });
  }
});

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

if (process.argv[2] === "ingest") {
  ingestCirculars()
    .then(() => {
      console.log("Ingestion finished. Exiting.");
      process.exit(0);
    })
    .catch(err => {
      console.error("Ingestion failed:", err);
      process.exit(1);
    });
} else {
  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`\n✓ Backend running on http://localhost:${port}`);
    console.log(`✓ Webhook URL: http://localhost:5678/webhook/circulars-query`);
    console.log(`✓ Health check: http://localhost:${port}/health`);
  });
}
