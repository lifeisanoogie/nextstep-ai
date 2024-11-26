// Existing variables for buttons and state
const blueOrb = document.getElementById("blue-orb");
const userInput = document.getElementById("user-input");
const sendButton = document.getElementById("send-button");
const recordButton = document.getElementById("record-button");
const stopButton = document.getElementById("stop-button");
const processingIndicator = document.getElementById("processing-indicator");
const gearIcon = document.getElementById("gear-icon");
const jobSuggestionsContainer = document.getElementById("job-suggestions");
let isRecording = false;
let transcriptionData = ""; // Variable to store transcription data
let chat_history = [];
let firstChat = true;

// Add event listener for the play/pause button
const playPauseButton = document.getElementById("play-pause-button");
const playPauseIcon = document.getElementById("play-pause-icon");
let isAudioPlaying = false; // Track audio playing state

playPauseButton.addEventListener("click", () => {
    const audioElement = document.getElementById("audio");

    // Check if there is a valid audio source
    if (!audioElement.src) {
        console.warn("No audio source available to play.");
        alert("No audio available to play."); // Notify the user
        return; // Exit the function if no audio is available
    }

    if (isAudioPlaying) {
        audioElement.pause(); // Pause the audio
        playPauseIcon.src = "{{ url_for('static', filename='img/play-icon.png') }}"; // Change to play icon
    } else {
        audioElement.play() // Play the audio
            .then(() => {
                console.log("Audio is playing");
                playPauseIcon.src = "{{ url_for('static', filename='img/pause-icon.png') }}"; // Change to pause icon
            })
            .catch(error => {
                console.error("Error playing audio:", error);
                alert("Error playing audio. Please try again."); // Notify the user of the error
            });
    }

    isAudioPlaying = !isAudioPlaying; // Toggle the state
});

// Start recording
recordButton.addEventListener("click", async () => {
    isRecording = true; // Set to true immediately
    recordButton.style.display = "none"; // Hide the record button
    stopButton.style.display = "inline-block"; // Show the stop button
    document.getElementById("record-indicator").style.display = "block"; // Show the record indicator

    try {
        // Start recording
        const response = await fetch('/start_recording', { method: 'POST' });
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
    const response = await fetch('/stop_recording', { method: 'POST' });
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

// Function to play audio and sync the blue orb
function playAudio(audioBase64) {
    const audio = new Audio("data:audio/wav;base64," + audioBase64);
    const blueOrb = document.getElementById("blue-orb");

    // Set the audio element to the global variable
    const audioElement = document.getElementById("audio");
    audioElement.src = "data:audio/wav;base64," + audioBase64;

    // Create an audio context and analyser
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const analyser = audioContext.createAnalyser();
    const source = audioContext.createMediaElementSource(audio);
    source.connect(analyser);
    analyser.connect(audioContext.destination);

    // Set up frequency data array
    const frequencyData = new Uint8Array(analyser.frequencyBinCount);

    // Function to update the orb's animation based on frequency data
    function updateOrb() {
        analyser.getByteFrequencyData(frequencyData);
        const averageFrequency = frequencyData.reduce((a, b) => a + b) / frequencyData.length;
        const scale = 1 + (averageFrequency / 256); // Scale based on frequency

        blueOrb.style.transform = `translateX(-50%) scale(${scale})`;
        requestAnimationFrame(updateOrb);
    }

    // Start playing the audio and animation
    audio.play()
        .then(() => {
            console.log("Audio is playing");
            blueOrb.style.display = "block";
            updateOrb(); // Start updating the orb
            isAudioPlaying = true; // Set audio playing state
            playPauseIcon.src = "{{ url_for('static', filename='img/pause-icon.png') }}"; // Change to pause icon
        })
        .catch(error => {
            console.error("Error playing audio:", error);
            alert("Error playing audio. Please try again."); // Notify the user of the error
        });

    // Hide the blue orb when the audio ends
    audio.onended = () => {
        blueOrb.style.transform = "translateX(-50%) scale(1)"; // Reset scale
        isAudioPlaying = false; // Reset audio playing state
        playPauseIcon.src = "{{ url_for('static', filename='img/play-icon.png') }}"; // Change to play icon
    };
}

// Add event listener for the send button
sendButton.addEventListener("click", async () => {
    const userMessage = userInput.value.trim(); // Get the user input and trim whitespace
    if (userMessage === "") return; // Prevent sending empty messages

    // Show gear icon to indicate loading
    processingIndicator.style.display = "block"; // Show processing indicator
    gearIcon.style.display = "flex"; // Show gear icon
    sendButton.disabled = true; // Disable the send button to prevent multiple clicks

    // Clear the input box after sending the message
    userInput.value = ""; // Clear the input box

    // Update the chat history array
    chat_history.push({ role: "user", content: userMessage });

    // Display the user's message in the chat history
    displayChatMessage(userMessage, "user-message");

    try {
        const endpoint = firstChat ? '/generate' : '/followup'; // Determine the endpoint based on firstChat
        if (firstChat) firstChat = false; // Set firstChat to false after the first message

        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ text: userMessage }) // Send the user message
        });

        const data = await response.json(); // Get the response data
        console.log("Response from server:", data); // Log the response data

        // Check if ttsResponse exists and display it
        if (data.ttsResponse) {
            displayChatMessage(data.ttsResponse, "assistant-message"); // Display ttsResponse
            chat_history.push({ role: "assistant", content: data.ttsResponse }); // Update chat history
        } else {
            console.warn("No ttsResponse found in the response data.");
        }

        // Display the follow-up response if it's not the first chat
        if (!firstChat && data.followupResponse) {
            displayChatMessage(data.followupResponse, "assistant-message"); // Display followupResponse
            chat_history.push({ role: "assistant", content: data.followupResponse }); // Update chat history
        }

        // Display the job suggestions in the job suggestions container
        if (data.suggestions) {
            displayJobSuggestions(data.suggestions); // No need to parse again
        }

        // Play the audio if available
        if (data.audio) {
            playAudio(data.audio);
        }

    } catch (error) {
        console.error("Error sending message:", error);
    } finally {
        // Reset UI elements after processing
        processingIndicator.style.display = "none"; // Hide processing indicator
        gearIcon.style.display = "none"; // Hide gear icon
        sendButton.disabled = false; // Re-enable the send button
    }
});

// Function to display job suggestions
function displayJobSuggestions(suggestions) {
    const container = document.getElementById("job-suggestions");
    container.innerHTML = ""; // Clear previous suggestions

    suggestions.forEach((job) => {
        const jobCard = document.createElement("div");
        jobCard.classList.add("job-card");
        jobCard.innerHTML = `
            <h3>${job.title}</h3>
            <p>${job.description || "Description not available."}</p>
            <p><strong>Key Skills:</strong> ${job.skills || "Not specified."}</p>
            <p><strong>Salary:</strong> ${job.salary || "Data not available."}</p>
            <p><strong>Projected Growth:</strong> ${job.growth || "Not provided."}</p>
            <p><strong>Recommended Companies:</strong> ${job.companies || "No recommendations available."}</p>
            <p><strong>Certifications:</strong> ${job.certifications || "No certifications available."}</p>
        `;
        container.appendChild(jobCard);
    });
}

// Function to download job suggestions as an Excel file
function downloadJobSuggestions() {
    const jobSuggestions = jobSuggestionsContainer.innerHTML; // Get the job suggestions container content
    if (!jobSuggestions) {
        alert("No job suggestions available to download.");
        return; // Exit if there are no job suggestions
    }

    // Parse the job suggestions from the container
    const jobCards = Array.from(jobSuggestionsContainer.children);
    const data = jobCards.map(card => {
        const title = card.querySelector("h3").innerText;
        const description = card.querySelector("p").innerText;
        const skills = card.querySelector("p:nth-of-type(2)").innerText.replace("Skills:", "").trim();
        const salary = card.querySelector("p:nth-of-type(3)").innerText.replace("Salary:", "").trim();
        const growth = card.querySelector("p:nth-of-type(4)").innerText.replace("Growth:", "").trim();
        const companies = card.querySelector("p:nth-of-type(5)").innerText.replace("Companies:", "").trim();
        const certifications = card.querySelector("p:nth-of-type(6)").innerText.replace("Certifications:", "").trim();

        return {
            Title: title,
            Description: description,
            Skills: skills,
            Salary: salary,
            Growth: growth,
            Companies: companies,
            Certifications: certifications
        };
    });

    // Create a new workbook and add the data
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Job Suggestions");

    // Generate a download link and trigger the download
    XLSX.writeFile(workbook, "job_suggestions.xlsx");
}

// Add event listener for the download button
document.getElementById("download-jobs-button").addEventListener("click", downloadJobSuggestions);


// Function to display chat messages
function displayChatMessage(message, className) {
    const chatHistoryContainer = document.getElementById("chat-history");
    const messageElement = document.createElement("div");
    messageElement.className = className;
    messageElement.textContent = message;
    chatHistoryContainer.appendChild(messageElement);
}

// Add event listener for the new chat button
document.getElementById("new-chat-button").addEventListener("click", async () => {
    try {
        // Stop any currently playing audio
        const audioElement = document.getElementById("audio");
        if (!audioElement.paused) {
            audioElement.pause(); // Pause the audio
            audioElement.currentTime = 0; // Reset the audio to the beginning
        }

        // Send a request to reset the chat
        const response = await fetch('/reset_chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error("Failed to reset chat");
        }

        // Clear the chat history
        chat_history = []; // Reset the chat history array
        const chatHistoryContainer = document.getElementById("chat-history");
        chatHistoryContainer.innerHTML = ""; // Clear the chat history display

        // Clear job suggestions
        const jobSuggestionsContainer = document.getElementById("job-suggestions");
        jobSuggestionsContainer.innerHTML = ""; // Clear the job suggestions display

        // Reset the user input field
        userInput.value = ""; // Clear the input box

        // Optionally, reset any other UI elements or states as needed
        processingIndicator.style.display = "none"; // Hide processing indicator
        gearIcon.style.display = "none"; // Hide gear icon
        firstChat = true; // Reset first chat indicator

        console.log("Chat history reset successfully.");
    } catch (error) {
        console.error("Error resetting chat:", error);
    }
});
