import os
import json
from typing import List, Dict, Any, Optional
from firebase_admin import firestore
from llm_service import SkillNode
from dotenv import load_dotenv

load_dotenv()

USE_GCLOUD = os.getenv("USE_GCLOUD", "false").lower() == "true"

# ==============================================================================
# In-Memory Store (Active when USE_GCLOUD=false)
# ==============================================================================
# Schema mirrors BigQuery & Firestore
_IN_MEMORY_STORE = {
    "skill_trees": {},       # uid -> List[dict]
    "career_paths": {},      # uid -> dict
    "job_market_data": {},   # uid -> List[dict]
    "resume_bullets": {},    # uid -> List[str]
    "parsed_cvs": {},        # uid -> str
}

# ==============================================================================
# Google Cloud Clients (Initialized only if USE_GCLOUD=true)
# ==============================================================================
bq_client = None
if USE_GCLOUD:
    try:
        from google.cloud import bigquery
        bq_client = bigquery.Client()
    except Exception as e:
        print(f"Warning: Failed to initialize BigQuery client: {e}")

def get_db():
    print("Executing: storage_service.py -> get_db()")
    if not USE_GCLOUD:
        return None
    try:
        return firestore.client()
    except Exception as e:
        print(f"Warning: Firestore client not initialized: {e}")
        return None

# ==============================================================================
# Abstraction Methods
# ==============================================================================

def save_skill_tree(uid: str, skills: List[SkillNode]):
    print(f"Executing: storage_service.py -> save_skill_tree() [uid: {uid}]")
    """Saves hierarchical skill data to active storage backends."""
    skills_dict = [skill.model_dump() for skill in skills]
    
    # 1. Firestore (Always active)
    db = get_db()
    if db:
        db.collection("users").document(uid).collection("skill_tree").document("latest").set({"skills": skills_dict})
    
    # 2. GCloud Toggle
    if USE_GCLOUD and bq_client:
        dataset_id = os.getenv("BIGQUERY_DATASET", "skillsync_data")
        table_id = f"{bq_client.project}.{dataset_id}.skill_tree"
        rows_to_insert = [{"uid": uid, **skill} for skill in skills_dict]
        try:
            errors = bq_client.insert_rows_json(table_id, rows_to_insert)
            if errors:
                print(f"BigQuery Insert Errors: {errors}")
        except Exception as e:
            print(f"BigQuery Error: {e}")
    else:
        _IN_MEMORY_STORE["skill_trees"][uid] = skills_dict

def get_skill_tree(uid: str) -> List[dict]:
    """Retrieves skill tree for the user."""
    # Attempt to read from memory first if not using GCloud
    if not USE_GCLOUD and uid in _IN_MEMORY_STORE["skill_trees"]:
        return _IN_MEMORY_STORE["skill_trees"][uid]
    
    # Fallback to Firestore
    db = get_db()
    if db:
        doc = db.collection("users").document(uid).collection("skill_tree").document("latest").get()
        if doc.exists:
            return doc.to_dict().get("skills", [])
    return []

def save_job_market_research(uid: str, research: dict):
    print(f"Executing: storage_service.py -> save_job_market_research() [uid: {uid}]")
    """Saves job market research."""
    db = get_db()
    if db:
        db.collection("users").document(uid).collection("market_research").document("latest").set(research)
        
    if USE_GCLOUD and bq_client:
        dataset_id = os.getenv("BIGQUERY_DATASET", "skillsync_data")
        table_id = f"{bq_client.project}.{dataset_id}.job_market_research"
        rows_to_insert = [{"uid": uid, "research": json.dumps(research)}]
        try:
            bq_client.insert_rows_json(table_id, rows_to_insert)
        except Exception as e:
            print(f"BigQuery Error: {e}")
    else:
        if uid not in _IN_MEMORY_STORE["job_market_data"]:
            _IN_MEMORY_STORE["job_market_data"][uid] = []
        _IN_MEMORY_STORE["job_market_data"][uid].append(research)

def save_career_path(uid: str, career_path: dict):
    print(f"Executing: storage_service.py -> save_career_path() [uid: {uid}]")
    """Saves forecasted career path."""
    db = get_db()
    if db:
        db.collection("users").document(uid).collection("career_path").document("latest").set(career_path)
    
    if not USE_GCLOUD:
        _IN_MEMORY_STORE["career_paths"][uid] = career_path

def get_career_path(uid: str) -> Optional[dict]:
    """Retrieves forecasted career path."""
    if not USE_GCLOUD and uid in _IN_MEMORY_STORE["career_paths"]:
        return _IN_MEMORY_STORE["career_paths"][uid]
        
    db = get_db()
    if db:
        doc = db.collection("users").document(uid).collection("career_path").document("latest").get()
        if doc.exists:
            return doc.to_dict()
    return None

def save_resume_bullets(uid: str, bullets: List[str]):
    print(f"Executing: storage_service.py -> save_resume_bullets() [uid: {uid}]")
    """Saves resume bullets. Writes to local file or Google Docs depending on toggle."""
    db = get_db()
    if db:
        db.collection("users").document(uid).collection("resume").document("latest").set({"bullets": bullets})
    
    if not USE_GCLOUD:
        _IN_MEMORY_STORE["resume_bullets"][uid] = bullets
        os.makedirs("output", exist_ok=True)
        with open(f"output/resume_bullets_{uid}.txt", "w", encoding="utf-8") as f:
            f.write("\n".join(f"- {b}" for b in bullets))
    else:
        # Google Docs API Implementation
        try:
            from googleapiclient.discovery import build
            import google.auth
            credentials, project = google.auth.default(scopes=['https://www.googleapis.com/auth/documents'])
            service = build('docs', 'v1', credentials=credentials)
            
            # Create a new document
            title = f"SkillSync Resume Bullets - {uid}"
            body = {'title': title}
            doc = service.documents().create(body=body).execute()
            document_id = doc.get('documentId')
            
            # Prepare requests to insert bullets
            requests = []
            text_to_insert = "SkillSync Generated Resume Bullets:\n\n" + "\n".join(f"- {b}" for b in bullets) + "\n"
            requests.append({
                'insertText': {
                    'location': {'index': 1},
                    'text': text_to_insert
                }
            })
            
            # Execute the update
            service.documents().batchUpdate(documentId=document_id, body={'requests': requests}).execute()
            print(f"Created Google Doc for {uid}: https://docs.google.com/document/d/{document_id}/edit")
        except Exception as e:
            print(f"Failed to write to Google Docs API: {e}")

def get_resume_bullets(uid: str) -> List[str]:
    """Retrieves generated resume bullets for the frontend."""
    if not USE_GCLOUD and uid in _IN_MEMORY_STORE["resume_bullets"]:
        return _IN_MEMORY_STORE["resume_bullets"][uid]
        
    db = get_db()
    if db:
        doc = db.collection("users").document(uid).collection("resume").document("latest").get()
        if doc.exists:
            return doc.to_dict().get("bullets", [])
    return []

def save_parsed_cv(uid: str, cv_text: str):
    print(f"Executing: storage_service.py -> save_parsed_cv() [uid: {uid}]")
    """Saves parsed CV text to Firestore, with an in-memory fallback."""
    db = get_db()
    if db:
        db.collection("users").document(uid).set({"parsed_cv": cv_text}, merge=True)
    
    if not USE_GCLOUD or not db:
        _IN_MEMORY_STORE["parsed_cvs"][uid] = cv_text

def get_parsed_cv(uid: str) -> str:
    """Retrieves parsed CV text from Firestore or in-memory fallback."""
    if not USE_GCLOUD and uid in _IN_MEMORY_STORE["parsed_cvs"]:
        return _IN_MEMORY_STORE["parsed_cvs"][uid]
        
    db = get_db()
    if db:
        doc = db.collection("users").document(uid).get()
        if doc.exists:
            return doc.to_dict().get("parsed_cv", "")
    return ""

def clear_user_data(uid: str):
    print(f"Executing: storage_service.py -> clear_user_data() [uid: {uid}]")
    """Clears all parsed CV data, skill trees, and career paths for a user."""
    # 1. Clear In-Memory Store
    if uid in _IN_MEMORY_STORE["skill_trees"]:
        _IN_MEMORY_STORE["skill_trees"][uid] = []
    if uid in _IN_MEMORY_STORE["career_paths"]:
        _IN_MEMORY_STORE["career_paths"][uid] = {}
    if uid in _IN_MEMORY_STORE["job_market_data"]:
        _IN_MEMORY_STORE["job_market_data"][uid] = []
    if uid in _IN_MEMORY_STORE["resume_bullets"]:
        _IN_MEMORY_STORE["resume_bullets"][uid] = []
    if uid in _IN_MEMORY_STORE["parsed_cvs"]:
        _IN_MEMORY_STORE["parsed_cvs"][uid] = ""

    # 2. Clear Firestore Documents
    db = get_db()
    if db:
        try:
            db.collection("users").document(uid).collection("skill_tree").document("latest").delete()
            db.collection("users").document(uid).collection("market_research").document("latest").delete()
            db.collection("users").document(uid).collection("career_path").document("latest").delete()
            db.collection("users").document(uid).collection("resume").document("latest").delete()
            db.collection("users").document(uid).set({"parsed_cv": ""}, merge=True)
        except Exception as e:
            print(f"Warning: Failed to clear Firestore data for user {uid}: {e}")
