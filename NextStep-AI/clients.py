from openai import OpenAI
from elevenlabs.client import ElevenLabs
from secret_keys import ELEVENLABS_API_KEY, OPENAI_API_KEY

# ---------------------------------------------------
# ------------------ OpenAI CLIENT ------------------
# --------------------------------------------------- 

openai_client = OpenAI(
    api_key=OPENAI_API_KEY
)

# ---------------------------------------------------
# ---------------- ElevenLabs CLIENT ----------------
# --------------------------------------------------- 

elevenlabs_client = ElevenLabs(
    api_key=ELEVENLABS_API_KEY
)