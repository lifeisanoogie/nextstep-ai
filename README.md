# **NextStep AI**

_Interactive Job Search Assistant Using Generative AI_

## **Overview**

NextStep AI is a web-based application designed to assist users in exploring career opportunities by leveraging generative AI tools. The platform allows users to interact with an intelligent avatar, share their academic background and interests, and receive personalized job suggestions with key details like salary ranges, job growth, and degree requirements.

The project utilizes state-of-the-art generative AI services for speech-to-text, natural language understanding, text-to-speech, and avatar creation.

---

## **Features**

- **Speech-to-Text**: Converts user speech into text using OpenAI Whisper.
- **Job Recommendations**: Provides tailored job titles and details using GPT-4.
- **Text-to-Speech**: Delivers job suggestions in a natural-sounding voice using ElevenLabs.
- **Interactive Avatar**: Displays suggestions through a lifelike video avatar powered by D-ID.

---

## **System Architecture**

1. **Speech Input**: Users speak about their interests and academic background.
2. **Speech-to-Text**: Whisper API processes the audio into text.
3. **Job Generation**: GPT-4 generates job suggestions based on the transcription.
4. **Text-to-Speech**: ElevenLabs converts the text suggestions into audio.
5. **Avatar Presentation**: D-ID creates a video of an avatar delivering the suggestions.

---

## **Technology Stack**

- **Frontend**: HTML, CSS, JavaScript (hosted on GitHub Pages).
- **APIs Used**:
 - [OpenAI Whisper](https://openai.com/whisper): Speech-to-text conversion.
 - [OpenAI GPT-4](https://platform.openai.com/docs/models/gpt-4): Job suggestion generation.
 - [ElevenLabs](https://elevenlabs.io/): Natural text-to-speech conversion.
 - [Synthesia](https://www.synthesia.io/): Video avatar creation.

---

## **How to Use**

1. **Open the Website**: Visit the hosted web app (link coming soon).
2. **Record Your Input**: Click the record button and describe your interests or academic background.
3. **Receive Suggestions**:
 - View personalized job recommendations in text and avatar format.
 - Listen to the suggestions presented by the avatar.

---

## **Setup and Installation**

If you wish to run the project locally or contribute:

### Prerequisites

- A modern web browser for frontend testing.
- API keys for the following services:
 -OpenAI Whisper
 - OpenAI GPT-4
 - ElevenLabs
 - Synthesia

### Steps

1. **Clone the Repository**:
 ```bash
 git clone https://github.com/lifeisanoogie/nextstep-ai.git
 cd nextstep-ai
 ```

2. **Install Dependencies**:

 - If a local backend is needed, set up Python and install required libraries:
  ```bash
  pip install flask openai requests
  ```

3. **Add API Keys**:

 - Place your API keys in a .env file or a secure location:
 ```bash
 OPENAI_API_KEY=your_openai_key
 ELEVENLABS_API_KEY=your_elevenlabs_key
 SYNTHESIA_API_KEY=your_did_key
 ```

4. **Run the Web App**:

 - For local testing, you can serve the frontend using a simple HTTP server:
 ```bash
 python -m http.server
 ```

---

## **Project Status**

- Current Version: 1.0 (Prototype)
- Upcoming Features:
 - Improved error handling.
 - Integration of additional job-related APIs for accurate salary and growth data.
 - Enhanced user interface with better accessibility.

---

## **Contributing**

Contributions are welcome! If you have suggestions for improving CareerCompanion or would like to report issues, please follow these steps:

1. Fork the repository.

2. Create a new branch:
```bash
git checkout -b feature-name
```

3. Commit your changes:
```bash
git commit -m "Added feature-name"
```

4. Push your branch:
```bash
git push origin feature-name
```

5. Submit a pull request.

---

## **License**

This project is licensed under the `[LICENSE TYPE HERE]` License. See the LICENSE file for details.

---

## **Contact**

If you have questions or feedback, feel free to reach out:

- Project Owner: Timothy Stelmat
- Email: timothystelmat@gmail.com
- GitHub: lifeisanoogie
