# SkillSync 🚀

SkillSync is an AI-powered career strategist and talent capability extractor. It analyzes a user's CV and recent work activity (e.g., from GitHub or Jira) to automatically extract a comprehensive "Skill Tree", generate impact-driven resume bullets using the STAR method, and forecast future career paths based on live job market research.

## 🌟 Key Features

*   **Resume Forge (Agent 1):** Ingests PDF/DOCX CVs and work activity to extract a structured Skill Tree (Technical, Soft Skills, Domain Knowledge) and generates polished STAR-method resume bullets.
*   **Career Radar (Agent 2):** Autonomously researches live job market trends using DuckDuckGo search to perform gap analysis, identify target roles, and recommend actions based on your current Skill Tree.
*   **Cloud & Local Modes:** Runs seamlessly either entirely locally (in-memory storage and file outputs) or integrated with Google Cloud Platform (Pub/Sub, Firestore, BigQuery, Google Docs API) by toggling the `USE_GCLOUD` flag.
*   **Multi-LLM Support:** Built with LangChain, supporting both Google Gemini (`gemini-3.1-flash-lite`) and HuggingFace models (e.g., `meta-llama/Llama-3.1-8B-Instruct, Mistral-7B-Instruct`) for agent execution.
*   **Immersive Frontend:** A sleek React web application powered by Vite, Tailwind CSS, Framer Motion, and 3D elements using React Three Fiber.

## 🛠️ Tech Stack

**Backend:**
*   **Framework:** FastAPI, Uvicorn
*   **AI/Agents:** LangChain, Google Generative AI (Gemini), HuggingFace Hub, DuckDuckGo Search
*   **Cloud / Storage:** Firebase Admin, Google Cloud (Firestore, BigQuery, Pub/Sub, Docs API)
*   **Document Parsing:** PyMuPDF (PDF), python-docx (Word)

**Frontend:**
*   **Core:** React 18, Vite, TypeScript
*   **Styling & UI:** Tailwind CSS, Framer Motion, Lucide React, Recharts
*   **3D Elements:** Three.js, React Three Fiber & Drei
*   **Auth:** Firebase Authentication

## 🚀 Getting Started

### Prerequisites
*   Python 3.9+
*   Node.js & npm (for frontend)

### Backend Setup

1.  **Clone & Navigate:**
    ```bash
    cd Skillsync_python_no_gcloud
    ```

2.  **Install Python Dependencies:**
    ```bash
    pip install -r requirements.txt
    ```

3.  **Environment Variables:**
    Create a `.env` file in the root directory (you can use `.env.example` as a template):
    ```env
    # LLM Configuration
    AGENT1_MODEL=gemini # or huggingface
    GEMINI_API_KEY=your_gemini_api_key
    HUGGINGFACE_API_KEY=your_hf_api_key
    
    # GCP / Firebase Configuration
    USE_GCLOUD=false # Set to true to enable Firestore, BigQuery, Pub/Sub
    SKIP_AUTH=true   # Set to true to bypass Firebase auth for local dev
    ```

4.  **Run the FastAPI Server:**
    ```bash
    uvicorn main:app --reload --host 0.0.0.0 --port 8080
    ```
    *(Alternatively, run `start.bat` on Windows)*

### Frontend Setup

1.  **Navigate to Frontend:**
    ```bash
    cd frontend
    ```

2.  **Install Dependencies:**
    ```bash
    npm install
    ```

3.  **Run the Development Server:**
    ```bash
    npm run dev
    ```

## 🧠 System Architecture

1.  **Data Ingestion:** Users upload their CV via the frontend or webhook endpoints ingest activity from GitHub/Jira.
2.  **Sequential Agent Processing:**
    *   **Agent 1 (Skill Tree Extraction):** Parses documents, understands context, and leverages structured outputs to build a comprehensive Skill Tree and generate resume bullet points.
    *   **Agent 2 (Market Research):** Takes the extracted Skill Tree, searches live market data, and generates a forecasted career path with gap analysis.
3.  **Storage layer:** Depending on `USE_GCLOUD`, results are written to memory/local files or synced across Firestore, BigQuery, and Google Docs.

## 📄 License
MIT License
