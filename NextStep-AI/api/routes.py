from flask import Blueprint, request, jsonify, render_template
from api.api_clients import openai_job_suggestions, tts_elevenlabs, openai_followup
from api.audio_recorder import AudioRecorder
from settings import clear_message_history
import base64
import logging
import json

routes = Blueprint('routes', __name__)

# Global instance of AudioRecorder
recorder = AudioRecorder()

@routes.route("/generate", methods=["POST"])
def generate():
    data = request.json
    user_input = data.get("text")

    print(f"Got input: ", user_input)
    try:
        if not user_input:
            return jsonify({"error": "No text provided for OpenAI API."}), 400
        
        suggestions_parsed, tts_response = openai_job_suggestions(user_input)

        if suggestions_parsed is None:
            return jsonify({"error": "Failed to get response from OpenAI"}), 500
        
        # Ensure suggestions is a list, not a set
        if isinstance(suggestions_parsed, set):
            suggestions_parsed = list(suggestions_parsed)

        audio = tts_elevenlabs(tts_response)
        if not audio:
            return jsonify({"error": "Failed to generate TTS audio"}), 500

        audio_base64 = base64.b64encode(audio).decode("utf-8")
        return jsonify({
            "audio": audio_base64, 
            "suggestions": suggestions_parsed, 
            "ttsResponse": tts_response
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@routes.route("/followup", methods=["POST"])
def followup():
    data = request.json
    user_input = data.get("text")
    print(f"Got input: ", user_input)
    try:
        if not user_input:
            return jsonify({"error": "No text provided for OpenAI API."}), 400
        
        followup_response = openai_followup(user_input)

        audio = tts_elevenlabs(followup_response)
        if not audio:
            return jsonify({"error": "Failed to generate TTS audio"}), 500

        audio_base64 = base64.b64encode(audio).decode("utf-8")
        return jsonify({
            "audio": audio_base64, 
            "followupResponse": followup_response
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@routes.route("/start_recording", methods=["POST"])
def start_recording_route():
    try:
        recorder.start()
        return jsonify({"message": "Recording started"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@routes.route("/stop_recording", methods=["POST"])
def stop_recording_route():
    try:
        transcription = recorder.stop()
        return jsonify({"message": f"Recording saved to {recorder.filename}", "transcription": transcription.text}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@routes.route("/reset_chat", methods=["POST"])
def reset_chat():
    try:
        # Clear the default message history
        clear_message_history()  # Call the function to clear the message history
        return jsonify({"message": "Chat history reset successfully."}), 200
    except Exception as e:
        logging.error(f"Error resetting chat: {e}")
        return jsonify({"error": str(e)}), 500

@routes.route("/", methods=["GET"])
def home():
    return render_template("index.html")