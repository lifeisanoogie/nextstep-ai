import threading
import pyaudio
import wave
import logging
from api.api_clients import openai_whisper

class AudioRecorder:
    def __init__(self, filename="output.wav", chunk=1024, channels=1, rate=44100, format=pyaudio.paInt16):
        self.filename = filename
        self.chunk = chunk
        self.channels = channels
        self.rate = rate
        self.format = format
        self.frames = []
        self.recording = False
        self.p = None
        self.stream = None
        self.recording_thread = None

    def _initialize_pyaudio(self):
        """Initialize the PyAudio instance and stream."""
        self.p = pyaudio.PyAudio()

        # Debugging: Check if PyAudio detects any input devices
        if self.p.get_device_count() == 0:
            raise OSError("No audio input devices found. Please check your microphone settings.")

        self.stream = self.p.open(
            format=self.format,
            channels=self.channels,
            rate=self.rate,
            input=True,  # Use default input device
            frames_per_buffer=self.chunk
        )

    def start(self):
        """Start recording in a separate thread."""
        try:
            self.frames = []  # Clear frames for the new recording
            self.recording = True
            self._initialize_pyaudio()  # Reinitialize PyAudio and stream
            logging.info("Recording started.")

            # Start a background thread for continuous recording
            self.recording_thread = threading.Thread(target=self._record_continuously)
            self.recording_thread.start()
        except OSError as e:
            logging.error("Error initializing PyAudio. Ensure a default input device is configured.")
            logging.error(e)
            raise

    def _record_continuously(self):
        """Internal method to record audio continuously in a loop."""
        while self.recording:
            try:
                data = self.stream.read(self.chunk, exception_on_overflow=False)
                self.frames.append(data)
            except Exception as e:
                logging.error("Error while recording:", e)
                break
        logging.info("Recording thread stopped.")

    def stop(self):
        """Stop recording and save the audio file."""
        if not self.recording:
            return

        # Save the audio to a file
        with wave.open(self.filename, 'wb') as wf:
            wf.setnchannels(self.channels)
            wf.setsampwidth(self.p.get_sample_size(self.format))
            wf.setframerate(self.rate)
            wf.writeframes(b''.join(self.frames))
        logging.info(f"Recording saved to {self.filename}")

        self.recording = False  # Stop the recording loop
        self.recording_thread.join()  # Wait for the thread to finish
        self.stream.stop_stream()
        self.stream.close()
        self.p.terminate()  # Ensure PyAudio instance is terminated
        self.p = None  # Reset PyAudio instance

        return openai_whisper("output.wav")
