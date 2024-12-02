# **NextStep AI**

NextStep AI is an interactive web application that provides personalized job suggestions and career advice, powered by generative AI tools like OpenAI and ElevenLabs. The application also uses a text-to-speech (TTS) feature to deliver responses in a natural, conversational tone.

---

## **Features**

- **Personalized Job Suggestions**: Receive tailored job recommendations based on your academic background, skills, and interests.
- **Follow-Up Question Handling**: Ask follow-up questions about job suggestions, skills, or industries for more clarity and guidance.
- **Text-to-Speech Integration**: Hear responses read aloud through a seamless TTS interface.
- **Interactive User Experience**: A clean and simple web interface for user interaction.
- **Dynamic Message History**: Context-aware responses based on previous interactions.

---

## **Video Demonstration**

https://youtu.be/jDF2w17CenY

---

## **Technologies Used**

- **Backend**: Python, Flask
- **Frontend**: HTML, CSS, JavaScript
- **APIs**:
  - OpenAI GPT for generating job suggestions and answering follow-up questions.
  - ElevenLabs for generating natural-sounding TTS audio.
- **Audio Recording**: PyAudio for recording and processing user audio input.

---

## **Setup Instructions**

### Prerequisites

- **Python 3.8+**
- **Node.js (optional for frontend customization)**

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/nextstep-ai.git
   cd nextstep-ai
   ```

2. Install the required Python libraries:
    ```bash
    pip install -r requirements.txt
    ```

3. Create a .env file in the root directory:
  - Copy the contents of .env.example:

    ```bash
    OPENAI_API_KEY=your_openai_api_key_here
    ELEVENLABS_API_KEY=your_elevenlabs_api_key_here
    ```

  - Replace the placeholders with your actual API keys

4. Run the Flask application:
    ```bash
    python app.py
    ```
  
5. Open the application in your browser:
  - Visit `http://127.0.0.1:5000`

### File Structure

```bash
nextstep-ai/
├── app.py                  # Main Flask application
├── settings.py             # Environment and configuration settings
├── api
│   ├── api_clients.py      # API integrations for OpenAI and ElevenLabs
│   ├── audio_recorder.py   # Handles audio recording and processing
│   ├── routes.py           # Defines application routes
├── templates/              # HTML files
│   ├── index.html          # Main webpage template
├── static/
│   ├── style.css           # Styling for the application
│   ├── script.js           # JavaScript for frontend interaction
├── .env.example            # Template for environment variables
├── requirements.txt        # Python dependencies
```

### How to Contribute

I welcome contributions! Follow the steps to get involved:

1. Fork the repository.
2. Create a new branch:
  ```bash
  git checkout -b feature-name
  ```
3. Make your changes and commit them:
  ```bash
  git commit -m "Add new feature"
  ```
4. Push your brnach to your forked repository:
  ```bash
  git push origin feature-name
  ```
5. Open a pull request.

### Known Issues
- The application currently does not support restarting audio from the beginning. The audio can only be paused and the played again from the same point.
- TTS responses might take slightly longer for complex queries due to API processing time.
- There seem to be some bugs in the handling of the JSON from the first API client every now and then, it seems to stem from a very specific way of phrasing the way a user asks for jobs and how the first API call responds.
- Must start a new chat using the "New Chat" in order to get another set of jobs, if the user wants the previous jobs to be excluded, they must explicitly say something like "other than job1, job2, ...". The user will be informed of this if they ask for more jobs.

### Feature Enhancements
- Add a database to store user preferences and history for personalized recommendations.
- Implement advanced audio controls (e.g., playback, media control UI).
- Enhance the UI with better animations and accessibility features.

### License
This project is licensed under the GNU General Public License v3. See the [LICENSE](./LICENSE) file for details.

### Acknowledgments
- Dr. Tyler Bells and his class on Generative AI Tools at the University of Iowa. Without his instruction on APIs this project would not exist.

### Contact
For any questions or suggestions, please contact timothystelmat@gmail.com
