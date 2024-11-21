from clients import elevenlabs_client

# ---------------------------------------------------
# -------------------- FUNCTIONS --------------------
# --------------------------------------------------- 

def text_to_speech_elevenlabs(tts_response):
    # Debug line to know when OpenAI API is called
    print("Calling text_to_speech_elevenlabs function")

    # Assuming the generate method returns a generator
    audio_generator = elevenlabs_client.generate(
        text=tts_response,
        voice="cgSgspJ2msm6clMCkdW9",
        model="eleven_turbo_v2_5"
    )

    # Collect all audio chunks into a single bytes object
    audio_content = b''.join(audio_generator)

    # Debug line to know when leaving the function
    print("Leaving text_to_speech_elevenlabs function")

    return audio_content