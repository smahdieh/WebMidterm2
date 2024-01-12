// Event listener for DOMContentLoaded to execute when the page is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    loadSavedAnswers(); // Load saved answers when the page loads
    enableButtons(); // Call the function to enable buttons when the page loads
});

// Add event listener for input changes in the name field to update button status
document.getElementById('nameInput').addEventListener('input', enableButtons);

// Function to enable or disable buttons based on the name input
function enableButtons() {
    const nameInput = document.getElementById('nameInput').value.trim();
    const saveButton = document.getElementById('saveButton');
    const submitButton = document.querySelector('button[type="submit"]');

    // Enable the buttons only if the name is not empty
    saveButton.disabled = submitButton.disabled = nameInput === '';
}

// Function to predict gender based on the entered name
function predictGender() {
    const nameInput = document.getElementById('nameInput').value.trim();

    // Check if the name matches the allowed pattern
    const namePattern = /^[a-zA-Z\s]+$/;
    if (!namePattern.test(nameInput)) {
        displayError('Please enter a valid name containing only spaces and English letters.');
        return;
    }

    // Check if the name exceeds the maximum length
    if (nameInput.length > 255) {
        displayError('Please enter a name with a maximum of 255 characters.');
        return;
    }

    // Fetch gender prediction from an external API
    fetch(`https://api.genderize.io/?name=${encodeURIComponent(nameInput)}`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Error predicting gender. Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            // Display the prediction result and update button status
            displayPredictionResult(nameInput, data.gender, data.probability);
            enableButtons();
            loadSavedAnswersForName(nameInput);
        })
        .catch(error => {
            displayError('Error predicting gender. Please try again.');
        });
}

// Function to display the gender prediction result
function displayPredictionResult(name, gender, probability) {
    const resultContainer = document.getElementById('predictionResult');
    resultContainer.innerHTML = `
        <h3>Gender Prediction:</h3>
        <p>Gender: ${gender}</p>
        <p>Probability: ${probability}</p>
    `;
}

// Function to enable the save button
function enableSaveButton() {
    const saveButton = document.getElementById('saveButton');
    saveButton.disabled = false;
}

// Function to save the user's answer (name and selected gender)
function saveAnswer() {
    const nameInput = document.getElementById('nameInput').value.trim();
    const genderOptions = document.getElementsByName('genderOption');
    let selectedGender = '';

    // Find the selected gender option
    for (const option of genderOptions) {
        if (option.checked) {
            selectedGender = option.value;
            break;
        }
    }

    // Check if name or gender is not selected before saving
    if (nameInput === '' || selectedGender === '') {
        displayError('Please select a gender before saving.');
        return;
    }

    let savedAnswers = JSON.parse(localStorage.getItem('savedAnswers')) || {};

    // Update or add the saved answer based on the name
    if (savedAnswers[nameInput]) {
        savedAnswers[nameInput] = selectedGender;
    } else {
        savedAnswers[nameInput] = selectedGender;
        displaySavedMessage('The name has been saved successfully');
    }

    // Save the updated answers to local storage
    localStorage.setItem('savedAnswers', JSON.stringify(savedAnswers));
    //loadSavedAnswersForName(nameInput);
}

// Function to load and display saved answers for a specific name
function loadSavedAnswersForName(name) {
    let savedAnswers = JSON.parse(localStorage.getItem('savedAnswers')) || {};
    const savedAnswersContainer = document.getElementById('savedAnswers');

    let html = '';

    // Check if there is a saved answer for the given name
    if (savedAnswers[name]) {
        html += '<div class="saved-answer">';
        html += `<h3>Saved Answer</h3>`;
        html += `<p>${savedAnswers[name]}</p>`;
        html += `<button type="button" onclick="clearSavedResult('${name}')">Clear</button>`;
        html += '</div>';
    } else {
        // Remove saved message after 3 seconds if there's no saved answer
        setTimeout(() => {
            const savedMessage = document.querySelector('.saved-message');
            if (savedMessage) {
                savedMessage.remove();
            }
        }, 3000);
    }

    // Display the saved answers
    savedAnswersContainer.innerHTML = html;
}

// Function to clear a saved result for a specific name
function clearSavedResult(name) {
    let savedAnswers = JSON.parse(localStorage.getItem('savedAnswers')) || {};

    // Check if there is a saved answer for the given name
    if (savedAnswers[name]) {
        delete savedAnswers[name];
        // Save the updated answers to local storage and reload the saved answers
        localStorage.setItem('savedAnswers', JSON.stringify(savedAnswers));
        loadSavedAnswersForName(name);
    }
}

// Function to clear the form inputs, prediction result, and saved answers
function clearForm() {
    document.getElementById('genderForm').reset();
    document.getElementById('predictionResult').innerHTML = '';
    document.getElementById('savedAnswers').innerHTML = '';
}

// Function to clear the selected gender options
function clearGenders() {
    const genderOptions = document.getElementsByName('genderOption');

    for (const option of genderOptions) {
        option.checked = false;
    }
}

// Function to clear all saved answers
function clearSavedAnswers() {
    localStorage.removeItem('savedAnswers');
    document.getElementById('savedAnswers').innerHTML = '';
    loadSavedAnswers();
}

// Function to display an error message
function displayError(message) {
    const errorContainer = document.getElementById('predictionResult');
    errorContainer.innerHTML = `<p style="color: red;">${message}</p>`;
}

// Function to display a success message for saved answers
function displaySavedMessage(message) {
    const savedAnswersContainer = document.getElementById('savedAnswers');
    savedAnswersContainer.innerHTML = `<p class="saved-message">${message}</p>`;
}
