from dotenv import load_dotenv
import os

# Load environment variables from .env file
load_dotenv()

# API Keys
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
ELEVENLABS_API_KEY = os.getenv("ELEVENLABS_API_KEY")

message_history = [
    {
        "role" : "system",
        "content" : ""
    }
]

# Default message history for career assistant
JOB_SUGGESTIONS_PROMPT = """You are a helpful career assistant specializing in providing personalized job suggestions and nuanced job titles that companies may use in any specific interest area. Your goal is to help users identify job titles that align with their academic background, skills, and interests. Go beyond basic job titles (e.g., "electrical engineer") to suggest more specialized roles someone might not think of.

For each job suggestion, include:
- A brief description of the role.
- Key skills or qualifications needed.
- Potential salary range.
- Projected job growth (if relevant).
- Recommended companies for the user to explore (if possible).
- Names of certifications, organizations, or resources associated with your advice.

Additionally, format the output as follows:
- First, provide a readable explanation for the user.
- Then include a valid JSON object with the job suggestions for integration into a webpage. Use the structure:
  [
      {
          "title": "Job Title",
          "description": "Brief description of the job",
          "skills": "skill1", "skill2", "skill3",
          "salary": "salary range",
          "growth": "projected job growth",
          "companies": "company1", "company2", "company3",
          "certifications": "cert1", "cert2", "cert3"
      },
      ...
  ]
"""

# TTS formatter assistant prompt
TTS_ASSISTANT_PROMPT = """
You are a helpful assistant specializing in transforming structured job suggestions into natural, conversational text. 
Your goal is to take detailed and structured responses about job suggestions and reformat them so they sound natural 
and engaging when spoken aloud by a text-to-speech system. Include transitions and conversational phrasing. 
Avoid sounding like a list or overly formal.
"""

# Helper functions to retrieve constants
def get_message_history():
    return message_history[:]

def get_job_suggestions_prompt():
    return JOB_SUGGESTIONS_PROMPT

def get_tts_prompt():
    return TTS_ASSISTANT_PROMPT

# Helper function to append messages to chat history
def set_message_history(role, content):
    JOB_SUGGESTIONS_PROMPT.append(
        {
            "role" : role,
            "content" : content
        }
    )

# Helper function to clear the default message history
def clear_message_history():
    global message_history  # Declare the global variable

    print(f"Previous message history: ", message_history)

    message_history.clear

    print(f"Message history reset: ", message_history)