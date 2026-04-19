# pip install python-dotenv

import os
from dotenv import load_dotenv

load_dotenv()

USE_MODEL       = os.getenv("USE_MODEL", "OLLAMA")

OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
OLLAMA_MODEL    = os.getenv("OLLAMA_MODEL", "gemma4:e2b")

OPENAI_API_KEY  = os.getenv("OPENAI_API_KEY", "")
OPENAI_MODEL    = os.getenv("OPENAI_MODEL", "gpt-4o")
