from openai_llm_functions import message_career_assistant
from elevenlabs_functions import text_to_speech_elevenlabs
from flask import Flask, render_template, request, jsonify
import base64
import json
import sounddevice as sd
import numpy as np
import wave
import io
from recording_functions import record_audio, start_recording, stop_recording  # Import the record_audio function

app = Flask(__name__)

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/generate", methods=["POST"])
def generate():
    data = request.json
    text = data["text"]
    try:
        print("Received generate request")
        response, tts_response = message_career_assistant(text)

        # Check if response is a valid JSON string
        try:
            suggestions = json.loads(response.strip())
            print("Parsed Suggestions:", suggestions)
        except json.JSONDecodeError as e:
            print("JSON Decode Error:", e)
            return jsonify({"error": "Invalid JSON format in suggestions"}), 500

        # Generate the TTS response
        audio = text_to_speech_elevenlabs(tts_response.strip())

        # Encode audio to base64
        audio_base64 = base64.b64encode(audio).decode("utf-8")

        return jsonify({
            "audio": audio_base64,
            "suggestions": suggestions
        })
    except Exception as e:
        print("Error during processing:", e)
        return jsonify({"error": str(e)}), 500

@app.route("/record", methods=["POST"])
def record():
    try:
        duration = int(request.json.get("duration", 5))  # Record for 5 seconds by default
        audio_data = record_audio("output.wav", duration=duration)
        return jsonify({
            "message": "Recording completed",
            "audio": audio_data.decode("latin1")  # Encode for JSON
        })
    except Exception as e:
        print("Error during recording:", e)
        return jsonify({"error": str(e)}), 500

@app.route("/start_recording", methods=["POST"])
def start_recording_route():
    start_recording()  # Call the function to start recording
    return jsonify({"message": "Recording started"}), 200

@app.route("/stop_recording", methods=["POST"])
def stop_recording_route():
    transcription = stop_recording()  # Call the function to stop recording
    return jsonify({"message": "Recording stopped", "transcription": transcription.text}), 200

if __name__ == "__main__":
    app.run(debug=True)
