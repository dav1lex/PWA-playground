const dbRequest = indexedDB.open('ExerciseTrackerDB', 1);
let db;

const exerciseForm = document.getElementById('exercise-form');
const exerciseInput = document.getElementById('exercise');
const setsInput = document.getElementById('sets');
const repsInput = document.getElementById('reps');
const weekdayInput = document.getElementById('weekday');
const exerciseWeekdays = document.getElementById('exercise-weekdays');

const editExerciseForm = document.getElementById('edit-exercise-form');
const editIdInput = document.getElementById('edit-id');
const editExerciseInput = document.getElementById('edit-exercise');
const editSetsInput = document.getElementById('edit-sets');
const editRepsInput = document.getElementById('edit-reps');
const editWeekdayInput = document.getElementById('edit-weekday');
const editModal = document.getElementById('edit-exercise-modal');
const infoModal = document.getElementById('info-exercise-modal');
const infoDetails = document.getElementById('info-exercise-details');

const isIos = /iphone|ipad|ipod/i.test(navigator.userAgent);
const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

if (isIos && isSafari) {
    const banner = document.getElementById('ios-install-banner');
    if (banner) {
        banner.classList.remove('hidden');
    } else {
        console.error("iOS install banner element not found");
    }
}

dbRequest.onupgradeneeded = (event) => {
    db = event.target.result;
    const objectStore = db.createObjectStore('exercises', { keyPath: 'id', autoIncrement: true });
    objectStore.createIndex('exercise', 'exercise', { unique: false });
    objectStore.createIndex('sets', 'sets', { unique: false });
    objectStore.createIndex('reps', 'reps', { unique: false });
    objectStore.createIndex('weekday', 'weekday', { unique: false });
    objectStore.createIndex('isDone', 'isDone', { unique: false });
};

dbRequest.onsuccess = (event) => {
    db = event.target.result;
    console.log('Database opened successfully');
    renderExercises(); // Render exercises on DB connection
};

dbRequest.onerror = (event) => {
    console.error('Database error:', event.target.errorCode);
};

document.addEventListener('DOMContentLoaded', () => {
    updateNetworkStatus();
    if (exerciseForm) {
        exerciseForm.addEventListener('submit', addExercise);
    } else {
        console.error("Exercise form element not found");
    }
    if (editExerciseForm) {
        editExerciseForm.addEventListener('submit', saveEditedExercise);
    } else {
        console.error("Edit exercise form element not found");
    }
    window.addEventListener('online', updateNetworkStatus);
    window.addEventListener('offline', updateNetworkStatus);
    enableDragAndDrop();
});

function renderExercises() {
    if (!exerciseWeekdays) {
        console.error("Exercise weekdays element not found");
        return;
    }
    exerciseWeekdays.innerHTML = '';

    const transaction = db.transaction('exercises', 'readonly');
    const objectStore = transaction.objectStore('exercises');
    const getAllRequest = objectStore.getAll();

    getAllRequest.onsuccess = () => {
        const exercises = getAllRequest.result.reduce((acc, exercise) => {
            acc[exercise.weekday] = acc[exercise.weekday] || [];
            acc[exercise.weekday].push(exercise);
            return acc;
        }, {});

        const weekdays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

        weekdays.forEach((weekday, index) => {
            const card = document.createElement('div');
            card.classList.add('border', 'mb-4', 'rounded', 'p-4', 'bg-white', 'shadow-md');

            const cardHeader = document.createElement('div');
            cardHeader.classList.add('bg-gray-200', 'p-2', 'rounded');
            cardHeader.innerHTML = `<h2 class="text-lg font-bold">${weekday}</h2>`;

            const cardBody = document.createElement('div');
            cardBody.classList.add('p-4');

            if (exercises[weekday] && exercises[weekday].length > 0) {
                const exerciseList = document.createElement('ul');
                exerciseList.classList.add('list-none', 'pl-0');

                exercises[weekday].forEach((exercise, idx) => {
                    const li = document.createElement('li');
                    li.classList.add('flex', 'justify-between', 'items-center', 'border-b', 'py-2', 'bg-white', 'shadow', 'rounded', 'mb-2');
                    li.setAttribute('draggable', 'true');
                    li.setAttribute('data-id', exercise.id);
                    if (exercise.isDone) {
                        li.classList.add('bg-green-100');
                    }

                    const detailsDiv = document.createElement('div');
                    detailsDiv.classList.add('text-gray-800', 'font-semibold', 'flex', 'flex-col');
                    detailsDiv.innerHTML = `
                        <span><strong>#${idx + 1}</strong></span>
                        <span><strong>Exercise:</strong> ${exercise.exercise}</span>
                        <span><strong>To-do:</strong> ${exercise.sets}x${exercise.reps} (sets x reps)</span>
                    `;

                    const buttonGroup = document.createElement('div');
                    buttonGroup.classList.add('flex', 'space-x-2', 'ml-auto');

                    const editButton = document.createElement('button');
                    editButton.textContent = 'Edit';
                    editButton.classList.add('px-2', 'py-1', 'text-white', 'bg-blue-500', 'rounded');
                    editButton.addEventListener('click', () => editExercise(exercise)); // Attach event handler

                    const infoButton = document.createElement('button');
                    infoButton.textContent = 'Info';
                    infoButton.classList.add('px-2', 'py-1', 'text-white', 'bg-gray-500', 'rounded');
                    infoButton.addEventListener('click', () => showExerciseInfo(exercise)); // Attach event handler

                    buttonGroup.appendChild(editButton);
                    buttonGroup.appendChild(infoButton);

                    li.appendChild(detailsDiv);
                    li.appendChild(buttonGroup);
                    exerciseList.appendChild(li);
                });

                cardBody.appendChild(exerciseList);
            } else {
                cardBody.textContent = 'No exercises for today';
            }

            card.appendChild(cardHeader);
            card.appendChild(cardBody);
            exerciseWeekdays.appendChild(card);
        });

        enableDragAndDrop();
    };
}


function addExercise(e) {
    e.preventDefault();

    const exercise = exerciseInput.value;
    const sets = parseInt(setsInput.value);
    const reps = parseInt(repsInput.value);
    const weekday = weekdayInput.value;

    if (!exercise || !sets || !reps || !weekday) {
        console.error('Please fill in all fields');
        return;
    }

    const newExercise = {exercise, sets, reps, weekday, isDone: false};
    saveExerciseToDB(newExercise);
}

function deleteExercise(id) {
    const transaction = db.transaction('exercises', 'readwrite');
    const objectStore = transaction.objectStore('exercises');

    const deleteRequest = objectStore.delete(id);

    deleteRequest.onsuccess = () => {
        console.log(`Exercise with id ${id} deleted.`);
        renderExercises(); // Re-render
        hideModal('info-exercise-modal'); // Hide modal after deletion
    };

    deleteRequest.onerror = (event) => {
        console.error('Delete failed', event.target.errorCode);
    };
}

function editExercise(exercise) {
    editIdInput.value = exercise.id;
    editExerciseInput.value = exercise.exercise;
    editSetsInput.value = exercise.sets;
    editRepsInput.value = exercise.reps;
    editWeekdayInput.value = exercise.weekday;
    editModal.classList.remove('hidden');
}

function showExerciseInfo(exercise) {
    if (infoDetails) {
        infoDetails.innerHTML = `
            <p><strong>Exercise:</strong> ${exercise.exercise}</p>
            <p><strong>Sets:</strong> ${exercise.sets}</p>
            <p><strong>Reps:</strong> ${exercise.reps}</p>
            <p><strong>Weekday:</strong> ${exercise.weekday}</p>
            <div class="form-check">
                <input type="checkbox" class="form-check-input" id="info-isDone" ${exercise.isDone ? 'checked' : ''}>
                <label class="form-check-label" for="info-isDone">Done</label>
            </div>
            <button type="button" class="w-full bg-red-500 text-white p-2 rounded mt-3" onclick="deleteExercise(${exercise.id})">Delete</button>
        `;

        const isDoneCheckbox = document.getElementById('info-isDone');
        isDoneCheckbox.addEventListener('change', () => toggleExerciseDone(exercise.id, isDoneCheckbox.checked));

        infoModal.classList.remove('hidden');
    } else {
        console.error("Info details element not found");
    }
}

function toggleExerciseDone(id, isDone) {
    const transaction = db.transaction('exercises', 'readwrite');
    const objectStore = transaction.objectStore('exercises');

    const getRequest = objectStore.get(id);

    getRequest.onsuccess = () => {
        const exercise = getRequest.result;
        exercise.isDone = isDone;

        const updateRequest = objectStore.put(exercise);

        updateRequest.onsuccess = () => {
            console.log(`Exercise with id ${id} updated.`);
            renderExercises(); // Re-render
        };

        updateRequest.onerror = (event) => {
            console.error('Update failed', event.target.errorCode);
        };
    };

    getRequest.onerror = (event) => {
        console.error('Get failed', event.target.errorCode);
    };
}

function saveExerciseToDB(exercise) {
    const transaction = db.transaction('exercises', 'readwrite');
    const objectStore = transaction.objectStore('exercises');

    const addRequest = objectStore.add(exercise);

    addRequest.onsuccess = () => {
        console.log('Exercise added:', exercise);
        renderExercises(); // Re-render
    };

    addRequest.onerror = (event) => {
        console.error('Failed to save exercise:', event.target.errorCode);
    };

    exerciseInput.value = '';
    setsInput.value = '';
    repsInput.value = '';
    weekdayInput.value = '';
}

function saveEditedExercise(e) {
    e.preventDefault();

    const id = parseInt(editIdInput.value);
    const exercise = editExerciseInput.value;
    const sets = parseInt(editSetsInput.value);
    const reps = parseInt(editRepsInput.value);
    const weekday = editWeekdayInput.value;

    if (!exercise || !sets || !reps || !weekday) {
        console.error('Please fill in all fields');
        return;
    }

    const updatedExercise = {id, exercise, sets, reps, weekday, isDone: false};
    updateExerciseInDB(updatedExercise);
}

function updateExerciseInDB(exercise) {
    const transaction = db.transaction('exercises', 'readwrite');
    const objectStore = transaction.objectStore('exercises');

    const updateRequest = objectStore.put(exercise);

    updateRequest.onsuccess = () => {
        console.log('Exercise updated:', exercise);
        renderExercises(); // Re-render
        editModal.classList.add('hidden');
    };

    updateRequest.onerror = (event) => {
        console.error('Failed to update exercise:', event.target.errorCode);
    };
}


function updateNetworkStatus() {
    const statusText = document.getElementById('status-text');
    if (navigator.onLine) {
        if (statusText) {
            statusText.textContent = 'You are online';
            statusText.classList.remove('text-red-500');
            statusText.classList.add('text-green-500');
        } else {
            console.error("Status text element not found");
        }
    } else {
        if (statusText) {
            statusText.textContent = 'You are offline';
            statusText.classList.remove('text-green-500');
            statusText.classList.add('text-red-500');
        } else {
            console.error("Status text element not found");
        }
    }
}

function enableDragAndDrop() {
    const listItems = document.querySelectorAll('[draggable="true"]');

    listItems.forEach(item => {
        item.addEventListener('dragstart', handleDragStart);
        item.addEventListener('dragover', handleDragOver);
        item.addEventListener('drop', handleDrop);
        item.addEventListener('dragend', handleDragEnd);
    });
}

function handleDragStart(e) {
    e.dataTransfer.setData('text/plain', e.target.dataset.id);
    e.target.classList.add('dragging');
}

function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
}

function handleDrop(e) {
    e.preventDefault();
    const id = e.dataTransfer.getData('text/plain');
    const draggableElement = document.querySelector(`[data-id="${id}"]`);
    const dropzone = e.target.closest('[draggable="true"]');

    if (dropzone && dropzone !== draggableElement) {
        const list = dropzone.parentNode;
        list.insertBefore(draggableElement, dropzone.nextSibling);
        updateExerciseOrder(list);
    }
}

function handleDragEnd(e) {
    e.target.classList.remove('dragging');
}

function updateExerciseOrder(list) {
    const items = list.querySelectorAll('[draggable="true"]');
    items.forEach((item, idx) => {
        const detailsDiv = item.querySelector('.flex.flex-col');
        if (detailsDiv) {
            detailsDiv.querySelector('span').innerHTML = `<strong>#${idx + 1}</strong>`;
        }
    });
}
