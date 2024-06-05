document.getElementById('athleteForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const data = {
        firstName: formData.get('firstName'),
        lastName: formData.get('lastName'),
        gender: formData.get('gender'),
        bestResult: parseFloat(formData.get('bestResult')).toFixed(2),
        ageGroup: formData.get('ageGroup'),
        event: formData.get('event')
    };

    try {
        // Check if the athlete already exists
        const athleteCheckResponse = await fetch(`/api/hspr/athlete/check?firstName=${data.firstName}&lastName=${data.lastName}&gender=${data.gender}`);
        const athleteCheckData = await athleteCheckResponse.json();
        
        let athleteId;

        if (athleteCheckData.exists) {
            athleteId = athleteCheckData.athleteId;
        } else {
            // Create a new athlete
            const athleteResponse = await fetch('/api/hspr/athlete', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    firstName: data.firstName,
                    lastName: data.lastName,
                    gender: data.gender
                })
            });

            if (!athleteResponse.ok) {
                const errorText = await athleteResponse.text();
                throw new Error(`Error: ${errorText}`);
            }

            const athleteData = await athleteResponse.json();
            athleteId = athleteData.athleteId;
        }

        // Save the result associated with the athlete
        const resultResponse = await fetch('/api/hspr/calculate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                athleteId: athleteId,
                event: data.event,
                bestResult: parseFloat(data.bestResult),
                ageGroup: data.ageGroup
            })
        });

        if (!resultResponse.ok) {
            const errorText = await resultResponse.text();
            throw new Error(`Error: ${errorText}`);
        }

        const resultData = await resultResponse.json();

        alert('Result saved successfully!');
        event.target.reset();

        // Fetch and display updated results
        await fetchAndDisplayResults();
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred, please try again.');
    }
});

async function fetchAndDisplayResults() {
    try {
        const response = await fetch('/api/hspr/results');
        const results = await response.json();

        const resultsTableBody = document.querySelector('#resultsTable tbody');
        resultsTableBody.innerHTML = ''; // Clear existing results

        results.forEach(result => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${result.first_name}</td>
                <td>${result.last_name}</td>
                <td>${result.gender}</td>
                <td>${result.age_group}</td>
                <td>${result.event}</td>
                <td>${result.best_result}</td>
                <td>${result.points}</td>
            `;
            resultsTableBody.appendChild(row);
        });
    } catch (error) {
        console.error('Error:', error);
    }
}

// Fetch and display results on page load
fetchAndDisplayResults();

async function fetchAndDisplayLeaderboard() {
    try {
        const response = await fetch('/api/hspr/leaderboard');
        const leaderboard = await response.json();

        const leaderboardTableBody = document.querySelector('#leaderboardTable tbody');
        leaderboardTableBody.innerHTML = '';

        let position = 1;

        leaderboard.forEach(athlete => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${position}</td>
                <td>${athlete.sportlane_eesnimi}</td>
                <td>${athlete.sportlane_perenimi}</td>
                <td>${athlete.sportlane_sugu}</td>
                <td>${athlete.tulemus_vanusegrupp}</td>
                <td>${athlete.tulemus_hooaeg}</td>
                <td>${athlete.punktid_sum}</td>
            `;
            leaderboardTableBody.appendChild(row);
            position++;
        });
    } catch (error) {
        console.error('Error:', error);
    }
}

fetchAndDisplayLeaderboard();

const firstNameInput = document.getElementById('firstName');
const firstNameSuggestions = document.getElementById('firstNameSuggestions');

firstNameInput.addEventListener('input', async () => {
    const prefix = firstNameInput.value;

    if (prefix.length === 0) {
        firstNameSuggestions.innerHTML = '';
        return;
    }

    try {
        const response = await fetch(`/api/hspr/athletes/firstNames?prefix=${prefix}`);
        const athletes = await response.json();

        firstNameSuggestions.innerHTML = '';
        athletes.forEach(athlete => {
            const item = document.createElement('div');
            item.classList.add('suggestion-item');
            item.textContent = `${athlete.first_name} ${athlete.last_name}`;
            item.addEventListener('click', () => {
                firstNameInput.value = athlete.first_name;
                document.getElementById('lastName').value = athlete.last_name;
                document.getElementById('gender').value = athlete.gender;
                firstNameSuggestions.innerHTML = '';
            });
            firstNameSuggestions.appendChild(item);
        });
    } catch (error) {
        console.error('Error:', error);
    }
});

const lastNameInput = document.getElementById('lastName');
const lastNameSuggestions = document.getElementById('lastNameSuggestions');

lastNameInput.addEventListener('input', async () => {
    const prefix = lastNameInput.value;

    if (prefix.length === 0) {
        lastNameSuggestions.innerHTML = '';
        return;
    }

    try {
        const response = await fetch(`/api/hspr/athletes/lastNames?prefix=${prefix}`);
        const athletes = await response.json();

        lastNameSuggestions.innerHTML = '';
        athletes.forEach(athlete => {
            const item = document.createElement('div');
            item.classList.add('suggestion-item');
            item.textContent = `${athlete.last_name}, ${athlete.first_name}`; // Corrected line
            item.addEventListener('click', () => {
                lastNameInput.value = athlete.last_name;
                document.getElementById('firstName').value = athlete.first_name;
                document.getElementById('gender').value = athlete.gender;
                lastNameSuggestions.innerHTML = '';
            });
            lastNameSuggestions.appendChild(item);
        });
    } catch (error) {
        console.error('Error:', error);
    }
});



