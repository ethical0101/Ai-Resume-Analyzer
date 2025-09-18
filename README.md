# AI Resume Analyzer (Resumind)

<p align="left">
  <a href="https://ai-resume-analyzer-136-p6pbk.puter.site/" target="_blank">
    <img alt="Live Demo" src="https://img.shields.io/badge/Live%20Demo-Online-22c55e?style=for-the-badge&logo=vercel&logoColor=white" />
  </a>
  <img alt="React" src="https://img.shields.io/badge/React-19-61dafb?style=for-the-badge&logo=react&logoColor=061a2b" />
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5-3178c6?style=for-the-badge&logo=typescript&logoColor=white" />
  <img alt="Tailwind" src="https://img.shields.io/badge/Tailwind-3-38bdf8?style=for-the-badge&logo=tailwindcss&logoColor=white" />
  <img alt="Puter.js" src="https://img.shields.io/badge/Puter.js-v2-8b5cf6?style=for-the-badge" />
</p>

An end-to-end web app that analyzes resumes against a target job using AI, provides an ATS score, and delivers actionable feedback on tone & style, content, structure, and skills.

This README is written to clearly showcase the project for recruiters and collaborators. It covers what the app does, how it’s built, and how to run and deploy it.

➡️ Live Demo: https://ai-resume-analyzer-136-p6pbk.puter.site/

## Demo Overview
- Upload a PDF resume and provide optional company, job title, and job description.
- The app converts the first page of the PDF to an image for preview.
- The PDF is analyzed by an AI model with context from the job description.
- You get a detailed review, an overall score, a dedicated ATS score, and categorized tips.
- Your previous analyses are listed so you can revisit them.

## Key Features
- AI-powered resume analysis tailored to a job description
- ATS score with positive and improvement suggestions
- PDF to image conversion (client-side) for in-app preview
- Persistent storage of resume metadata and feedback
- Auth-gated experience using Puter.js Auth
- Clean, responsive UI with Tailwind CSS
- Type-safe React app using TypeScript and React Router v7

## Tech Stack
- Frontend: React 19, React Router v7, TypeScript, Vite
- State: Zustand (custom Puter store)
- Styling: Tailwind CSS
- File handling: react-dropzone
- PDF rendering: pdfjs-dist (PDF.js)
- Platform SDK: Puter.js v2 (Auth, File System, Key-Value store, AI)
- Build/Dev: Vite with HMR
- Optional: Docker for containerized builds

## Architecture and Data Flow
1. Auth and Initialization
   - The app loads Puter.js script in app/root.tsx and initializes a Zustand store (app/lib/puter.ts) to expose auth, fs, kv, ai APIs.
   - Routes redirect unauthenticated users to /auth which triggers puter.auth.signIn.

2. Upload and Preparation (/upload)
   - User fills company name, job title, job description, and uploads a PDF (max 20MB).
   - Client converts the first page of the PDF to a PNG using pdf.js (app/lib/pdf2img.ts) and uploads both PDF and PNG to Puter FS.
   - A resume record is created and saved in Puter KV under key resume:{uuid}.

3. AI Analysis
   - The app calls ai.feedback in app/lib/puter.ts which wraps puter.ai.chat.
   - The prompt is composed via constants/prepareInstructions, injecting the job title and description.
   - The AI returns JSON matching the AIResponseFormat type, parsed and stored back to KV.

4. Review (/resume/:id)
   - The page loads the KV record, fetches the stored PDF and preview image from FS, and renders:
     - Overall Score (ScoreGauge/ScoreCircle)
     - ATS Score block with suggestions (components/ATS.tsx)
     - Detailed, categorized tips in an Accordion (components/Details.tsx)

5. History (/)
   - Lists past resume analyses from KV and their preview images using ResumeCard.

6. Maintenance (/wipe)
   - Authenticated route to delete all stored files and KV entries for a clean slate.

## Project Structure (high level)
- app/
  - components/ (Navbar, FileUploader, ScoreCircle/Gauge/Badge, ATS, Summary, Details, ResumeCard, Accordion)
  - lib/
    - puter.ts (Zustand store to wrap Puter.js: auth, fs, kv, ai)
    - pdf2img.ts (PDF → PNG conversion with PDF.js worker resolution)
    - utils.ts (helpers: classnames and byte formatting, UUID)
  - routes/
    - home.tsx (/) – list analyses, CTA to upload
    - upload.tsx (/upload) – form and upload/analyze flow
    - resume.tsx (/resume/:id) – detailed review
    - auth.tsx (/auth) – Puter sign-in redirector
    - wipe.tsx (/wipe) – internal utilities to clear app data
  - root.tsx – app shell, loads Puter.js script and initializes store
- constants/index.ts – AI prompt builder and response format contract
- public/ – static assets (icons, images, pdf.worker)

## Data Model (Feedback JSON)
The AI returns structured JSON matching this contract (excerpt from constants/AIResponseFormat):
- overallScore: number (0–100)
- ATS: { score: number; tips: { type: "good" | "improve"; tip: string }[] }
- toneAndStyle/content/structure/skills: {
  score: number;
  tips: { type: "good" | "improve"; tip: string; explanation: string }[]
}

Records are stored in KV under resume:{uuid} with fields:
- id, resumePath, imagePath, companyName, jobTitle, jobDescription, feedback

## Notable Implementation Details
- SSR is disabled (react-router.config.ts sets ssr: false) to simplify using the Puter.js browser SDK and PDF.js canvas rendering.
- Robust PDF.js worker resolution in pdf2img.ts tries Vite asset import, then public asset (/pdf.worker.min.mjs), then CDN.
- Drop-in uploader with react-dropzone enforces .pdf and 20 MB limit.
- Clean UI feedback during long-running steps (upload, convert, analyze).
- All file URLs are object URLs created from blobs read via Puter FS.

## Getting Started
### Prerequisites
- Node.js 18+ and npm
- Browser access to Puter.js v2 (loaded automatically from https://js.puter.com/v2/)
  - You’ll sign in via Puter’s hosted UI when hitting protected routes.

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```
- Visit http://localhost:5173
- You will be asked to authenticate with Puter when accessing protected routes.

### Build

```bash
npm run build
npm run preview
```

## Environment and Configuration
- No .env required for core functionality; Puter.js is loaded from a CDN in root.tsx.
- If you fork and host under a subpath, ensure the PDF worker is reachable. pdf2img.ts already falls back to /pdf.worker.min.mjs and a CDN URL. You may copy public/pdf.worker.min.mjs to match your hosting path.

## Docker (optional)
Build and run container:

```bash
docker build -t ai-resume-analyzer .
docker run -p 3000:3000 ai-resume-analyzer
```

Note: Ensure outbound access to js.puter.com from the running container or host environment for the Puter SDK.

## Usage Walkthrough
1. Sign in when prompted.
2. Go to Upload, add company/job details (optional but recommended), and drop your PDF.
3. Click “Analyze Resume”. The app uploads your PDF, creates a preview image, saves a record, and requests AI feedback.
4. You’ll be redirected to the review page with:
   - Overall score and ATS score
   - Category cards with concrete tips and explanations
   - Click the PDF preview to open the full resume
5. Return to Home to see your history and re-open any analysis.

## Routes
- / – Home (history list)
- /upload – New analysis
- /resume/:id – Detailed review
- /auth – Auth handler
- /wipe – Admin utility to purge data (authenticated)

## What I Built and Why It Matters
- Designed a cohesive UX for job seekers to quickly validate and improve resumes.
- Implemented a resilient client-side PDF-to-image pipeline with fallbacks for PDF.js worker delivery.
- Built a unified data layer with Puter.js (Auth/FS/KV/AI) wrapped in a typed Zustand store for simplicity and testability.
- Created clear visualizations (gauges, badges) that map raw scores into meaningful signals.
- Emphasized structured AI output to ensure reliable rendering and predictable UI logic.

## Limitations and Future Work
- Only first page of the PDF is previewed; extend to multi-page previews.
- Improve error states and retries around network and AI timeouts.
- Add export/share of feedback (PDF/Markdown) and versioning comparisons between iterations.
- Add role-specific prompt tuning and a library of job templates.
- Optional server-side persistence for portability beyond Puter KV.

## Contributing
- Fork the repo and open a PR. For larger features, please open an issue to discuss first.

## License
This project is licensed under the MIT License. See the LICENSE file for details.

## Acknowledgments
- PDF.js for rendering
- Puter.js for a unified Auth/FS/KV/AI SDK
- React Router team for the modern app framework
