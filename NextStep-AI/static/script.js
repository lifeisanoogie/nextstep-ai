// Existing variables for buttons and state
const blueOrb = document.getElementById("blue-orb");
const userInput = document.getElementById("user-input");
const sendButton = document.getElementById("send-button");
const recordButton = document.getElementById("record-button");
const stopButton = document.getElementById("stop-button");
const processingIndicator = document.getElementById("processing-indicator");
const gearIcon = document.getElementById("gear-icon");
let isRecording = false;
let transcriptionData = ""; // Variable to store transcription data

// Start recording
recordButton.addEventListener("click", async () => {
    isRecording = true; // Set to true immediately
    recordButton.style.display = "none"; // Hide the record button
    stopButton.style.display = "inline-block"; // Show the stop button
    document.getElementById("record-indicator").style.display = "block"; // Show the record indicator

    try {
        // Start recording
        const response = await fetch('/start_recording', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        console.log("Recording started:", await response.json());
    } catch (error) {
        console.error("Error starting recording:", error);
        resetRecordingButtons();
    }
});

// Stop recording
stopButton.addEventListener("click", async () => {
    isRecording = false; // Set to false immediately
    stopButton.style.display = "none"; // Hide the stop button
    recordButton.style.display = "none"; // Hide the record button
    document.getElementById("record-indicator").style.display = "none"; // Hide the record indicator
    processingIndicator.style.display = "block"; // Show processing indicator
    gearIcon.style.display = "flex"; // Show gear icon

    // Stop recording
    const response = await fetch('/stop_recording', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    });
    const data = await response.json(); // Get the transcription data
    console.log("Recording stopped:", data.message);
    console.log("Transcription:", data.transcription); // Log the transcription

    // Store the transcription data temporarily
    transcriptionData = data.transcription;

    // Reset button state
    recordButton.style.backgroundColor = "blue"; // Change back to blue when not recording

    // Delay before allowing another recording and setting the transcription
    setTimeout(() => {
        gearIcon.style.display = "none"; // Hide gear icon
        processingIndicator.style.display = "none"; // Hide processing indicator
        recordButton.style.display = "inline-block"; // Show the record button
        document.getElementById("user-input").value = transcriptionData; // Set the transcription in the text box
    }, 2000); // 2 seconds delay
});

// Function to play audio
function playAudio(audioBase64, text) {
    const audio = new Audio("data:audio/wav;base64," + audioBase64); // Create a new audio object
    const blueOrb = document.getElementById("blue-orb");

    // Show the blue orb
    blueOrb.style.display = "block"; // Ensure the orb is visible

    // Start playing the audio
    audio.play()
        .then(() => {
            console.log("Audio is playing");
            // Add the grow animation
            blueOrb.style.animation = "grow 1s ease-in-out infinite"; // Adjust duration as needed
        })
        .catch(error => {
            console.error("Error playing audio:", error);
        });

    // Hide the blue orb when the audio ends
    audio.onended = () => {
        blueOrb.style.animation = "none"; // Remove animation
        blueOrb.style.display = "none"; // Hide the orb after audio ends
    };
}

// Add event listener for the send button
sendButton.addEventListener("click", async () => {
    const userMessage = userInput.value; // Get the user input
    if (userMessage.trim() === "") return; // Prevent sending empty messages

    try {
        const response = await fetch('/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ text: userMessage }) // Send the user message
        });
        const data = await response.json(); // Get the response data
        console.log("Response from server:", data);
        
        // Clear the input box after sending the message
        userInput.value = ""; // Clear the input box

        // Display the job suggestions in the job suggestions container
        displayJobSuggestions(data.suggestions);

        // Play the audio if available
        if (data.audio) {
            playAudio(data.audio, data.ttsResponse); // Pass the TTS response text for the bubble
        }

    } catch (error) {
        console.error("Error sending message:", error);
    }
});

// Function to display job suggestions
function displayJobSuggestions(suggestions) {
    jobSuggestionsContainer.innerHTML = ""; // Clear previous suggestions
    const parsedSuggestions = JSON.parse(suggestions); // Parse the JSON string

    parsedSuggestions.forEach(job => {
        const jobCard = document.createElement("div");
        jobCard.className = "job-card";
        jobCard.innerHTML = `
            <h3>${job.title}</h3>
            <p>${job.description}</p>
            <p><strong>Skills:</strong> ${job.skills.join(", ")}</p>
            <p><strong>Salary:</strong> ${job.salary}</p>
            <p><strong>Growth:</strong> ${job.growth}</p>
            <p><strong>Companies:</strong> ${job.companies.join(", ")}</p>
            <p><strong>Certifications:</strong> ${job.certifications.join(", ")}</p>
        `;
        jobSuggestionsContainer.appendChild(jobCard); // Add the job card to the container
    });
}

// Function to adjust the width and height of the input box based on content
function adjustInputSize() {
    const userInput = document.getElementById("user-input");
    userInput.style.height = "auto"; // Reset height to auto to measure scrollHeight
    userInput.style.width = "auto"; // Reset width to auto to measure scrollWidth
    userInput.style.width = `${Math.min(userInput.scrollWidth, 500)}px`; // Set width to scrollWidth, max 500px
    userInput.style.height = `${userInput.scrollHeight}px`; // Set height to scrollHeight
}

// Add event listener to adjust size on input
userInput.addEventListener("input", adjustInputSize);

