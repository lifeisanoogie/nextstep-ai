from settings import OPENAI_API_KEY, ELEVENLABS_API_KEY, set_message_history, get_message_history, get_tts_prompt, get_job_suggestions_prompt
from openai import OpenAI
from elevenlabs.client import ElevenLabs
import logging
import re
import json

# Initialize API clients
openai_client = OpenAI(api_key=OPENAI_API_KEY)
elevenlabs_client = ElevenLabs(api_key=ELEVENLABS_API_KEY)

# OpenAI LLM API interaction
def openai_job_suggestions(user_input):
    print("Entering openai_job_suggestions function.")
    try:
        # Add user input to message to history
        set_message_history("user", user_input)

        response = openai_client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": get_job_suggestions_prompt()},
                {"role": "user", "content": user_input}
            ]
        )

        message = response.choices[0].message.content
        print("OpenAI response content: ", message)  # Log the full response content

        # Check for errors in the response
        if "error" in message.lower():
            logging.error("OpenAI API returned an error: " + message)
            return None, None

        # Use regex to find the JSON object
        json_match = re.search(r'(\[.*?\])', message, re.DOTALL)
        if json_match:
            suggestions_json = json_match.group(0)  # Capture the entire match
            print("Extracted JSON: ", suggestions_json)  # Log the extracted JSON
        else:
            logging.error("No valid JSON found in the response.")
            return None, None

        # Clean up the extracted JSON
        suggestions_json = suggestions_json.replace('\n', '').replace('\r', '').strip()

        # Validate the JSON structure
        try:
            suggestions_parsed = json.loads(suggestions_json)
        except json.JSONDecodeError as e:
            logging.error(f"JSON parsing error: {e}")
            logging.error(f"Invalid JSON: {suggestions_json}")  # Log the invalid JSON for debugging
            return None, None

        tts_response = openai_tts_reformat(message)
        tts_response = re.sub(r'\*\*(.*?)\*\*', r'\1', tts_response)

        print("Leaving openai_job_suggestions function.")
        return suggestions_parsed, tts_response
    except Exception as e:
        logging.error(f"OpenAI API error: {e}")
        return None, None

def openai_tts_reformat(structured_response):
    print("Entering openai_tts_reformat function.")
    # Generate next 'TTS Assistant' response by giving ChatGPT the latest response
    response = openai_client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": get_tts_prompt()},
            {"role": "user", "content": f"Please reformat this for TTS: {structured_response}"}
        ]
    )

    # Access the content correctly from the response
    tts_response = response.choices[0].message

    # Add conversational system message to history
    set_message_history("system", tts_response.content)

    print("Leaving openai_tts_reformat function.")
    # Return the TTS friendly response
    return tts_response.content

# OpenAI Whisper transcription
def openai_whisper(filename):
    with open(filename, "rb") as audio_file:
        transcription = openai_client.audio.transcriptions.create(
            model="whisper-1",
            file=audio_file
        )
        print("Transcription complete.")
        print("Transcription:", transcription.text)
        return transcription

def openai_followup(user_input):
    print("Entering followup function.")
    try:
        # Add user input to message to history
        set_message_history("user", user_input)

        response = openai_client.chat.completions.create(
            model="gpt-4o-mini",
            messages=get_message_history()
        )

        followup_response = response.choices[0].message

        # Add conversational system message to history
        set_message_history("system", followup_response.content)
        print("Leaving followup function.")
        # Return the TTS friendly response
        return followup_response.content
    except Exception as e:
        logging.error(f"OpenAI API error: {e}")
        return None    

# ElevenLabs TTS generation
def tts_elevenlabs(tts_response):
    print("Entering tts_elevenlabs function.")
    try:
        audio_generator = elevenlabs_client.generate(
            text=tts_response,
            voice="cgSgspJ2msm6clMCkdW9",
            model="eleven_turbo_v2_5"
        )
        print("ElevenLabs API successful.")
        return b''.join(audio_generator)
    except Exception as e:
        logging.error(f"ElevenLabs API error: {e}")
        return None