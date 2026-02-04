# RAG Q&A over Circulars using Endee + n8n

## Project Overview

This project is a Retrieval-Augmented Generation (RAG) chatbot that answers questions over college circulars and notices using **Endee** as the vector database and **n8n** as the orchestration layer.

Users send natural language questions to an n8n webhook, which calls a Node.js backend. The backend embeds the question, searches for similar circular chunks in Endee, and uses an LLM to generate a final answer grounded in the retrieved context.

## Problem Statement

Students often receive multiple circulars and notices in different formats, making it difficult to quickly find important information such as submission deadlines, eligibility criteria, and fee payment dates.

## System Design

**Backend (Node.js)** handles ingestion of circulars as text files, uses OpenAI embedding models to convert text chunks into vectors, stores vectors in Endee, and exposes `/rag-query` HTTP endpoint.

**Endee Vector Database** stores vectors in an index with metadata, supports semantic similarity search using cosine metric.

**n8n Workflow** receives POST requests on webhook, forwards to backend, and returns LLM answer.

### Data Flow
1. Read text files from `data/` folder
2. Split into overlapping chunks and generate embeddings
3. Upsert vectors to Endee with metadata
4. User sends question via n8n webhook
5. Backend embeds question and queries Endee for top-5 similar chunks
6. Sends context + question to GPT to generate answer

## How Endee is Used

Endee stores embedding vectors in `circulars_index` with cosine similarity metric. Vectors are indexed with metadata (title, source). For each user question, Endee searches for semantically similar chunks which are then used as context for the LLM.

## Setup and Execution

### Prerequisites
- Node.js >= 18
- Docker (for running Endee)
- OpenAI API key
- n8n running locally

### 1. Clone and Install
```bash
git clone https://github.com/YOUR_USERNAME/endee-n8n-rag-circulars.git
cd endee-n8n-rag-circulars
npm install
```

### 2. Configure .env
```env
OPENAI_API_KEY=sk-your-key-here
OPENAI_BASE_URL=https://api.openai.com/v1
EMBEDDING_MODEL=text-embedding-3-small
LLM_MODEL=gpt-3.5-turbo
ENDEE_BASE_URL=http://localhost:8080
ENDEE_INDEX_NAME=circulars_index
PORT=3000
```

### 3. Run Endee
```bash
docker run -p 8080:8080 endeelabs/endee:latest
```

### 4. Ingest Circulars
```bash
npm run ingest
```

### 5. Start Backend
```bash
npm start
```

### 6. Test Webhook
```bash
curl -X POST "http://localhost:5678/webhook/circulars-query" \
  -H "Content-Type: application/json" \
  -d '{"question": "What is the submission deadline?"}'
```

## Technologies
- **Vector DB**: Endee
- **Orchestration**: n8n
- **Backend**: Node.js + Express
- **Embeddings**: OpenAI text-embedding-3-small
- **LLM**: OpenAI GPT-3.5-turbo

## License
MIT License

## Web Chat Interface (Option 3)

For a user-friendly browser-based chat experience, open the `chat.html` file directly in your browser:

### Using the Chat Interface

1. **Open in Browser**: Simply open `chat.html` in your web browser
   - You can use: `File > Open` and select `chat.html`
   - Or host it on a local server and navigate to it

2. **Connect to n8n Webhook**: The chat interface is pre-configured to connect to:
   ```
   http://localhost:5678/webhook/circulars-query
   ```

3. **Ask Questions**: Type your questions in the input field and press `Enter` or click `Send`

4. **View Responses**: Responses from the RAG system will appear in the chat area

### Features

- **Real-time Chat**: Clean, modern UI with real-time message streaming
- **Error Handling**: Displays helpful error messages if connection fails
- **Responsive Design**: Works on desktop and mobile devices
- **Beautiful UI**: Purple gradient theme with smooth animations

### Requirements for Chat Interface

- n8n workflow running on `localhost:5678` and active
- Backend server running on `localhost:3000`
- Endee vector database running
- Modern web browser (Chrome, Firefox, Safari, Edge)

### Example Questions to Ask

- "What is the submission deadline?"
- "Find information about compensation structure"
- "What are the leave policies?"
- "Tell me about fee payment dates"

The chat interface will retrieve relevant information from your circulars and provide contextual answers powered by the Endee vector database!
