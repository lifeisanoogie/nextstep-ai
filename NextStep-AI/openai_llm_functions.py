from config import *
from clients import openai_client

# ---------------------------------------------------
# -------------------- FUNCTIONS --------------------
# --------------------------------------------------- 

# Sends user input to OpenAI API and recieves the response, appending both to the message history array.
# Also calls the reformat_for_tts function.
# See doc below for more detail or say help(message_career_assistant) in terminal.
def message_career_assistant(user_input):
    # Debug line to know when OpenAI API is called
    print("Calling message_career_assistant function")

    # Add user's last message to the chat array (context)
    career_assistant_message_history.append(
        {
            "role": "user",
            "content": user_input
        }
    )

    # Generate next 'Career Assistant' response by giving ChatGPT the entire history
    response = openai_client.chat.completions.create(
        model="gpt-4o-mini",
        messages=career_assistant_message_history
    )

    # Append newest response to the chat array (context)
    message = response.choices[0].message
    career_assistant_message_history.append(message)

    # Extract JSON part from the message
    json_start = message.content.find('[')
    json_end = message.content.rfind(']') + 1
    suggestions_json = message.content[json_start:json_end]

    # Reformat the response into a TTS friendly response
    tts_response = reformat_for_tts(message.content)

    print("Message Response:", message.content)
    print("Extracted JSON:", suggestions_json)
    print("TTS Response:", tts_response)

    # Debug line to know when leaving the function
    print("Leaving message_career_assistant function")

    # Return the JSON and TTS response
    return suggestions_json, tts_response


def reformat_for_tts(structured_response):
    # Debug line to know when OpenAI API is called
    print("Calling reformat_for_tts function")

    # Generate next 'TTS Assistant' response by giving ChatGPT the latest response
    response = openai_client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": tts_formatter_assistant_prompt},
            {"role": "user", "content": f"Please reformat this for TTS: {structured_response}"}
        ]
    )

    # Debug line to know when leaving the function
    print("Leaving reformat_for_tts function")

    # Return the TTS friendly response
    return response.choices[0].message.content

# ---------------------------------------------------
# ----------------------- DOCS ----------------------
# --------------------------------------------------- 

message_career_assistant.__doc__ = """
A function for sending the latest user message to OpenAI using their API to generate a standard response
from the "career assistant" (the career assistant prompt can be seen in the config file). The function then
passes the standard response to the reformat_for_tts function to generate a more TTS-friendly response. Both the
standard response and TTS-friendly response are returned.

Parameters:
    user_input (str): The latest message from the user.

Returns:
    tuple: A tuple containing the original response and the TTS-friendly response.

Function Steps:
    - Step 1: Print a debug message to the terminal.
    - Step 2: Append the latest user message to the career_assistant_message_history array.
    - Step 3: Generate the career assistant response.
    - Step 4: Append the career assistant response to the same array (logging the history for continuous conversation).
    - Step 5: Reformat the response into a TTS version.
    - Step 6: Return both the original and TTS responses.
"""

reformat_for_tts.__doc__ = """
A function for reformatting a response from the message_career_assistant API call into a more TTS-friendly version.

Parameters:
    structured_response (str): The latest career assistant response.

Returns:
    str: The TTS-friendly response.

Function Steps:
    - Step 1: Print a debug message to the terminal.
    - Step 2: Generate the TTS assistant response.
    - Step 3: Return the TTS assistant response.
"""