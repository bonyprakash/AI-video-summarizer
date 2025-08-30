# AI Video Summarizer - Starter Project

## Overview
This project provides a simple end-to-end starter for an AI-powered video summarizer.
- Frontend served from `/frontend` (also served by backend static server)
- Backend in `/backend` handles uploads, extracts audio (ffmpeg), sends audio to OpenAI Whisper for transcription, uses OpenAI chat for summarization, and DeepL for translation.

## Requirements
- Node.js (14+ recommended)
- npm
- ffmpeg installed and available on PATH
- OpenAI API key and DeepL API key

## Setup
1. Copy `.env.example` to `backend/.env` and fill your API keys:
   ```
   OPENAI_API_KEY=sk-...
   DEEPL_API_KEY=...
   PORT=3000
   ```

2. Install backend dependencies:
   ```
   cd backend
   npm install
   ```

3. Start the backend (it will also serve the frontend):
   ```
   npm start
   ```

4. Open in a browser:
   ```
   http://localhost:3000/
   ```

5. Upload a video and wait for processing. Processing includes audio extraction and external API calls so it may take several minutes depending on file length and API speeds.

## Notes & Next Steps
- This is a starter project — consider adding:
  - Persistent job storage (database)
  - Background worker queue (Redis + Bull)
  - More robust error handling & retries
  - S3 for file storage
  - Speaker diarization and timestamp-based highlights
  - Authentication & user accounts
- Keep your API keys secret. Do not commit `.env` to source control.

