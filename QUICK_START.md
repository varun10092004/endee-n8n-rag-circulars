# QUICK START - Complete Setup in 10 Minutes

## What You Need To Do Locally

This repository has been set up on GitHub with README, package.json, and .gitignore. You need to add the backend files locally and push them.

## Step 1: Clone the Repository

```bash
git clone https://github.com/varun10092004/endee-n8n-rag-circulars.git
cd endee-n8n-rag-circulars
```

## Step 2: Create Backend Files

Create the following folder structure locally:

```
backend/
  ├── index.js
  ├── endeeClient.js
  └── embeddings.js
data/
  ├── circular1.txt
  └── circular2.txt
.env
```

### Copy Backend Files

Create `backend/endeeClient.js`, `backend/embeddings.js`, and `backend/index.js` with the code provided in the main README.md file.

Create `.env` file with:
```
OPENAI_API_KEY=your_key_here
OPENAI_BASE_URL=https://api.openai.com/v1
EMBEDDING_MODEL=text-embedding-3-small
LLM_MODEL=gpt-3.5-turbo
ENDEE_BASE_URL=http://localhost:8080
ENDEE_INDEX_NAME=circulars_index
PORT=3000
```

Create sample data files in `data/` folder with circular content.

## Step 3: Install Dependencies

```bash
npm install
```

## Step 4: Push to GitHub

```bash
git add .
git commit -m "Add backend files and data"
git push origin main
```

## Step 5: Test Locally

### Start Endee
```bash
docker run -p 8080:8080 endeelabs/endee:latest
```

### Ingest Data
```bash
npm run ingest
```

### Start Backend
```bash
npm start
```

### Test via n8n Webhook
```bash
curl -X POST "http://localhost:5678/webhook/circulars-query" \
  -H "Content-Type: application/json" \
  -d '{"question": "What is the deadline?"}'
```

## Notes

- The n8n workflow is already active and configured
- Replace YOUR_USERNAME in URLs with your actual GitHub username
- Make sure Docker is running before starting Endee
- Get OpenAI API key from https://platform.openai.com/api-keys

## Submission

After everything is pushed to GitHub, submit the repository link here:
https://forms.gle/64e8AwWMms1X2Luu7

Deadline: February 4, 2026, 9:00 AM IST
