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

// Function to play audio and sync the blue orb
function playAudio(audioBase64, text) {
    const audio = new Audio("data:audio/wav;base64," + audioBase64);
    const blueOrb = document.getElementById("blue-orb");

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
        })
        .catch(error => {
            console.error("Error playing audio:", error);
        });

    // Hide the blue orb when the audio ends
    audio.onended = () => {
        blueOrb.style.transform = "translateX(-50%) scale(1)"; // Reset scale
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

