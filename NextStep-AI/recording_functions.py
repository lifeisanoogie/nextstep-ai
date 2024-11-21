import pyaudio
import wave
from openai import OpenAI
from secret_keys import OPENAI_API_KEY
from clients import openai_client

# Global variables
frames = []
recording = False

def record_audio(filename, chunk=1024, channels=1, rate=44100, format=pyaudio.paInt16):
    global frames, recording
    p = pyaudio.PyAudio()

    stream = p.open(format=format, 
                    channels=channels, 
                    rate=rate, input=True, 
                    frames_per_buffer=chunk)

    print("Recording started. Press 'Stop' to finish recording.")
    
    while recording:
        data = stream.read(chunk)
        frames.append(data)

    print("Recording finished. Total frames recorded:", len(frames))

    stream.stop_stream()
    stream.close()
    p.terminate()

    with wave.open(filename, 'wb') as wf:
        wf.setnchannels(channels)
        wf.setsampwidth(p.get_sample_size(format))
        wf.setframerate(rate)
        wf.writeframes(b''.join(frames))
    
    print("File saved as", filename)

def start_recording():
    global frames, recording
    frames = []  # Reset frames for new recording
    recording = True
    print("Starting recording...")  # Debug line
    record_audio("output.wav")  # Call the recording function

def stop_recording():
    global recording
    recording = False
    print("Stopping recording...")  # Debug line
    transcription = transcribe_audio("output.wav")  # Call transcription after stopping the recording
    frames.clear()  # Clear frames after transcription to prepare for the next recording
    print("Transcription completed.")  # Debug line
    return transcription  # Return the transcription if needed

def transcribe_audio(filename):
    with open(filename, "rb") as audio_file:
        transcription = openai_client.audio.transcriptions.create(
            model="whisper-1",
            file=audio_file
        )
        print("Transcription:", transcription.text)
        return transcription

if __name__ == "__main__":
    start_recording()  # This is just for testing; you can remove it later