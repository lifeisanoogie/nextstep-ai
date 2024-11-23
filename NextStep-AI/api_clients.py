from settings import OPENAI_API_KEY, ELEVENLABS_API_KEY
from openai import OpenAI
from elevenlabs.client import ElevenLabs
import logging

# Initialize API clients
openai_client = OpenAI(api_key=OPENAI_API_KEY)
elevenlabs_client = ElevenLabs(api_key=ELEVENLABS_API_KEY)

# OpenAI API interaction
def call_openai(prompt, context):
    try:
        response = openai_client.chat.completions.create(
            model="gpt-4o-mini",
            messages=context
        )
        return response.choices[0].message
    except Exception as e:
        logging.error(f"OpenAI API error: {e}")
        return None

# ElevenLabs TTS generation
def text_to_speech_elevenlabs(tts_response):
    try:
        audio_generator = elevenlabs_client.generate(
            text=tts_response,
            voice="cgSgspJ2msm6clMCkdW9",
            model="eleven_turbo_v2_5"
        )
        return b''.join(audio_generator)
    except Exception as e:
        logging.error(f"ElevenLabs API error: {e}")
        return None