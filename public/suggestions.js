// public/suggestions.js

export function addInputEventListeners(inputField, suggestionsList, fetchUrl, firstNameInput, lastNameInput, genderSelect) {
    inputField.addEventListener('input', async () => {
        const prefix = inputField.value.trim();

        if (prefix.length === 0) {
            suggestionsList.innerHTML = '';
            suggestionsList.style.display = 'none';
            return;
        }

        try {
            const response = await fetch(`${fetchUrl}?prefix=${encodeURIComponent(prefix)}`);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const athletes = await response.json();

            suggestionsList.innerHTML = '';
            if (athletes.length > 0) {
                suggestionsList.style.display = 'block';
                
                // Position and set width to match input field
                suggestionsList.style.width = `${inputField.offsetWidth}px`;
                suggestionsList.style.top = `${inputField.offsetTop + inputField.offsetHeight}px`; // Position below input
                suggestionsList.style.left = `${inputField.offsetLeft}px`; // Align with input field

                athletes.forEach(athlete => {
                    const item = document.createElement('li');
                    item.classList.add('suggestion-item');
                    item.textContent = `${athlete.eesnimi} ${athlete.perenimi}`;
                    item.addEventListener('click', () => {
                        if (fetchUrl.includes('firstNames')) {
                            firstNameInput.value = athlete.eesnimi;
                            lastNameInput.value = athlete.perenimi;
                        } else {
                            firstNameInput.value = athlete.eesnimi;
                            lastNameInput.value = athlete.perenimi;
                        }
                        // Autofill gender
                        if (genderSelect) {
                            genderSelect.value = athlete.sugu;
                        }
                        suggestionsList.innerHTML = '';
                        suggestionsList.style.display = 'none';
                    });
                    suggestionsList.appendChild(item);
                });
            } else {
                suggestionsList.style.display = 'none';
            }
        } catch (error) {
            console.error('Error fetching suggestions:', error);
            suggestionsList.innerHTML = '<li class="error-item">Error fetching data. Please try again later.</li>';
            suggestionsList.style.display = 'block';
            
            // Set width to match input field even in case of error
            suggestionsList.style.width = `${inputField.offsetWidth}px`;
        }
    });

    // Stop propagation on suggestion item click
    suggestionsList.addEventListener('click', event => event.stopPropagation());
}

export async function populateSeasonsDropdown() {
    try {
        const response = await fetch('/hspr/api/seasons');
        if (!response.ok) {
            throw new Error('Hooaegade kättesaamine ebaõnnestus');
        }
        const seasons = await response.json();
        const seasonInput = document.getElementById('seasonInput');
        seasonInput.innerHTML = '<option value="">Kõik hooajad</option>'; // The default option for all seasons
        seasons.forEach(season => {
            const option = document.createElement('option');
            option.value = season.hooaeg;
            option.textContent = season.hooaeg;
            seasonInput.appendChild(option);
        });
    } catch (error) {
        console.error('Viga hooaegade kättesaamisel:', error);
    }
}