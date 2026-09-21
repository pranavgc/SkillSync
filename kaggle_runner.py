import os
import uvicorn
from pyngrok import ngrok, conf
from dotenv import load_dotenv

def run_backend_on_kaggle():
    """
    Run this script inside a Kaggle Notebook cell to spin up the SkillSync backend
    and expose it to the public internet via Ngrok.
    """
    print("🚀 Initializing Kaggle Environment for SkillSync Backend...")
    
    # 1. Load environment variables
    load_dotenv()
    
    # 2. Get Ngrok Auth Token
    # Make sure you've set NGROK_AUTHTOKEN in your .env file or Kaggle Secrets
    ngrok_auth = os.getenv("NGROK_AUTHTOKEN")
    if not ngrok_auth:
        print("❌ ERROR: NGROK_AUTHTOKEN not found!")
        print("Please sign up at https://ngrok.com, get your Authtoken, and add it to your .env file.")
        return
    
    conf.get_default().auth_token = ngrok_auth
    
    # 4. Expose port 8080 to the public internet
    port = 8080
    public_url = ngrok.connect(port).public_url
    
    print("\n" + "="*60)
    print("✅ BACKEND IS LIVE ON KAGGLE!")
    print(f"🔗 Public URL: {public_url}")
    print("="*60)
    print("⚠️  NEXT STEP: Copy the URL above and paste it into your local frontend's .env file:")
    print(f"   VITE_API_BASE_URL={public_url}")
    print("="*60 + "\n")
    
    # 5. Start the FastAPI server
    from main import app
    uvicorn.run(app, host="0.0.0.0", port=port)

if __name__ == "__main__":
    run_backend_on_kaggle()
