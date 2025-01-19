const elements = {
    exerciseForm: document.getElementById('exercise-form'),
    editForm: document.getElementById('edit-exercise-form'),

    // input fields
    exerciseInput: document.getElementById('exercise'),
    setsInput: document.getElementById('sets'),
    repsInput: document.getElementById('reps'),
    weekdayInput: document.getElementById('weekday'),

    // Edit fields
    editId: document.getElementById('edit-id'),
    editExercise: document.getElementById('edit-exercise'),
    editSets: document.getElementById('edit-sets'),
    editReps: document.getElementById('edit-reps'),
    editWeekday: document.getElementById('edit-weekday'),

    // Display area
    exerciseList: document.getElementById('exercise-weekdays'),
    editModal: document.getElementById('edit-exercise-modal'),
    infoModal: document.getElementById('info-exercise-modal'),
    infoDetails: document.getElementById('info-exercise-details'),
    statusText: document.getElementById('status-text')
};

// database connection
let db = null;

//Set up database when the page loads
function setupDatabase() {
    const request = indexedDB.open('ExerciseTrackerDB', 1);

    // runs if we need to create or update the database
    request.onupgradeneeded = function(event) {
        const db = event.target.result;
        // Create db
        const store = db.createObjectStore('exercises', {
            keyPath: 'id',
            autoIncrement: true
        });

        // Add search indexes
        store.createIndex('exercise', 'exercise');
        store.createIndex('weekday', 'weekday');
        store.createIndex('isDone', 'isDone');
    };

    // runs after db is ready
    request.onsuccess = function(event) {
        db = event.target.result;
        showAllExercises(); // Show exercises
    };

    request.onerror = function(event) {
        console.log('Database error:', event.target.error);
    };
}

function addExercise(event) {
    event.preventDefault();
    // Get all the values from the form
    const newExercise = {
        exercise: elements.exerciseInput.value,
        sets: Number(elements.setsInput.value),
        reps: Number(elements.repsInput.value),
        weekday: elements.weekdayInput.value,
        isDone: false
    };

    //Save
    const transaction = db.transaction(['exercises'], 'readwrite');
    const store = transaction.objectStore('exercises');
    const request = store.add(newExercise);

    request.onsuccess = function() {
        // Clear the form and refresh the display
        elements.exerciseForm.reset();
        showAllExercises();
    };
}

function showAllExercises() {
    const transaction = db.transaction(['exercises'], 'readonly');
    const store = transaction.objectStore('exercises');
    const request = store.getAll();

    request.onsuccess = function() {
        const exercises = request.result;
        displayExercises(exercises);
    };
}

function displayExercises(exercises) {
    // Group exercises by day
    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    let html = '';

    // Create a section for each day
    days.forEach(day => {
        // Find exercises for this day
        const dayExercises = exercises.filter(ex => ex.weekday === day);

        if (dayExercises.length > 0) {
            html += `
                <div class="border mb-4 rounded p-4 bg-white shadow-md">
                    <div class="bg-gray-200 p-2 rounded">
                        <h2 class="text-lg font-bold">${day}</h2>
                    </div>
                    <div class="p-4">
                        ${dayExercises.map((exercise, index) => `
                            <div class="border-b py-2 ${exercise.isDone ? 'bg-green-100' : ''}">
                                <p><strong>#${index + 1}</strong></p>
                                <p><strong>Exercise:</strong> ${exercise.exercise}</p>
                                <p><strong>Sets × Reps:</strong> ${exercise.sets} × ${exercise.reps}</p>
                                <button onclick="showEditForm(${exercise.id})" 
                                        class="bg-blue-500 text-white px-2 py-1 rounded">
                                    Edit
                                </button>
                                <button onclick="showExerciseInfo(${exercise.id})" 
                                        class="bg-gray-500 text-white px-2 py-1 rounded">
                                    Info
                                </button>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }
    });

    elements.exerciseList.innerHTML = html;
}

//edit form
function showEditForm(id) {
    const transaction = db.transaction(['exercises'], 'readonly');
    const store = transaction.objectStore('exercises');
    const request = store.get(id);

    request.onsuccess = function() {
        const exercise = request.result;
        elements.editId.value = exercise.id;
        elements.editExercise.value = exercise.exercise;
        elements.editSets.value = exercise.sets;
        elements.editReps.value = exercise.reps;
        elements.editWeekday.value = exercise.weekday;

        elements.editModal.classList.remove('hidden');
        elements.editModal.classList.add('show');
    };
}

//Save edited exercise
function saveEditedExercise(event) {
    event.preventDefault();

    const updatedExercise = {
        id: Number(elements.editId.value),
        exercise: elements.editExercise.value,
        sets: Number(elements.editSets.value),
        reps: Number(elements.editReps.value),
        weekday: elements.editWeekday.value,
        isDone: false
    };

    const transaction = db.transaction(['exercises'], 'readwrite');
    const store = transaction.objectStore('exercises');
    const request = store.put(updatedExercise);

    request.onsuccess = function() {
        hideModal('edit-exercise-modal');
        showAllExercises();
    };
}

function showExerciseInfo(id) {
    const transaction = db.transaction(['exercises'], 'readonly');
    const store = transaction.objectStore('exercises');
    const request = store.get(id);

    request.onsuccess = function() {
        const exercise = request.result;
        elements.infoDetails.innerHTML = `
            <p><strong>Exercise:</strong> ${exercise.exercise}</p>
            <p><strong>Sets:</strong> ${exercise.sets}</p>
            <p><strong>Reps:</strong> ${exercise.reps}</p>
            <p><strong>Weekday:</strong> ${exercise.weekday}</p>
            <div class="mt-3">
                <label>
                    <input type="checkbox" 
                           onchange="toggleExerciseDone(${exercise.id}, this.checked)"
                           ${exercise.isDone ? 'checked' : ''}>
                    Done
                </label>
            </div>
            <button onclick="deleteExercise(${exercise.id})"
                    class="w-full bg-red-500 text-white p-2 rounded mt-3">
                Delete
            </button>
        `;

        elements.infoModal.classList.remove('hidden');
        elements.infoModal.classList.add('show');
    };
}

function deleteExercise(id) {
    const transaction = db.transaction(['exercises'], 'readwrite');
    const store = transaction.objectStore('exercises');
    const request = store.delete(id);

    request.onsuccess = function() {
        hideModal('info-exercise-modal');
        showAllExercises();
    };
}

//oggle completion
function toggleExerciseDone(id, isDone) {
    const transaction = db.transaction(['exercises'], 'readwrite');
    const store = transaction.objectStore('exercises');
    const request = store.get(id);

    request.onsuccess = function() {
        const exercise = request.result;
        exercise.isDone = isDone;
        store.put(exercise);
        showAllExercises();
    };
}

function hideModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.classList.add('hidden');
    modal.classList.remove('show');
}
//online/offline status
function updateOnlineStatus() {
    if (navigator.onLine) {
        elements.statusText.textContent = 'You are online';
        elements.statusText.classList.remove('text-red-500');
        elements.statusText.classList.add('text-green-500');
    } else {
        elements.statusText.textContent = 'You are offline';
        elements.statusText.classList.remove('text-green-500');
        elements.statusText.classList.add('text-red-500');
    }
}

//event listeners when the page loads
window.addEventListener('load', function() {
    setupDatabase();

    // Form submissions
    elements.exerciseForm.addEventListener('submit', addExercise);
    elements.editForm.addEventListener('submit', saveEditedExercise);

    // Online/offline detection
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);
    updateOnlineStatus();
});