class App {
    static async init() {
        try {
            await Database.setup();
            await this.loadExercises();
            this.setupEventListeners();
            NotificationManager.updateButton(Notification.permission);
        } catch (error) {
            console.error('Failed to initialize app:', error);
        }
    }

    static async loadExercises() {
        const exercises = await Database.getAllExercises();
        UI.displayExercises(exercises);
    }

    static setupEventListeners() {
        elements.exerciseForm.addEventListener('submit', this.handleAddExercise.bind(this));
        elements.editForm.addEventListener('submit', this.handleEditExercise.bind(this));
        elements.notificationBtn.addEventListener('click', NotificationManager.requestPermission);
        window.addEventListener('online', UI.updateOnlineStatus);
        window.addEventListener('offline', UI.updateOnlineStatus);
        UI.updateOnlineStatus();
    }

    static async handleAddExercise(event) {
        event.preventDefault();
        const form = event.target;
        const exercise = {
            exercise: form.exercise.value,
            sets: Number(form.sets.value),
            reps: Number(form.reps.value),
            weekday: form.weekday.value,
            isDone: false
        };
        try {
            await Database.addExercise(exercise);
            form.reset();
            await this.loadExercises();
        } catch (error) {
            console.error('Failed to add exercise:', error);
        }
    }

    static async handleEditExercise(event) {
        event.preventDefault();
        const form = event.target;

        const exercise = {
            id: Number(form.querySelector('#edit-id').value),
            exercise: form.querySelector('#edit-exercise').value,
            sets: Number(form.querySelector('#edit-sets').value),
            reps: Number(form.querySelector('#edit-reps').value),
            weekday: form.querySelector('#edit-weekday').value,
            isDone: false
        };
        try {
            await Database.updateExercise(exercise);
            UI.closeModal('edit-exercise-modal');
            await this.loadExercises();
        } catch (error) {
            console.error('Failed to update exercise:', error);
        }
    }

    static async showEditForm(id) {
        try {
            const exercise = await Database.getExercise(id);
            const form = elements.editForm;

            form.querySelector('#edit-id').value = exercise.id;
            form.querySelector('#edit-exercise').value = exercise.exercise;
            form.querySelector('#edit-sets').value = exercise.sets;
            form.querySelector('#edit-reps').value = exercise.reps;
            form.querySelector('#edit-weekday').value = exercise.weekday;

            elements.editModal.classList.remove('hidden');
            elements.editModal.classList.add('show');
        } catch (error) {
            console.error('Error fetching exercise for edit:', error);
        }
    }

    static async showExerciseInfo(id) {
        try {
            const exercise = await Database.getExercise(id);
            const infoDetails = document.getElementById('info-exercise-details');
            infoDetails.textContent = '';

            const details = document.createElement('div');
            details.appendChild(createInfoRow('Exercise', exercise.exercise));
            details.appendChild(createInfoRow('Sets', exercise.sets));
            details.appendChild(createInfoRow('Reps', exercise.reps));
            details.appendChild(createInfoRow('Weekday', exercise.weekday));

            const doneContainer = document.createElement('div');
            doneContainer.className = 'mt-3';

            const label = document.createElement('label');
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.checked = exercise.isDone;
            checkbox.addEventListener('change', () => this.toggleExerciseDone(exercise.id, checkbox.checked));

            label.appendChild(checkbox);
            label.appendChild(document.createTextNode(' Done'));
            doneContainer.appendChild(label);
            details.appendChild(doneContainer);

            const deleteBtn = document.createElement('button');
            deleteBtn.textContent = 'Delete';
            deleteBtn.className = 'w-full bg-red-500 text-white p-2 rounded mt-3';
            deleteBtn.onclick = () => this.deleteExercise(exercise.id);
            details.appendChild(deleteBtn);

            infoDetails.appendChild(details);
            elements.infoModal.classList.remove('hidden');
            elements.infoModal.classList.add('show');
        } catch (error) {
            console.error('Error fetching exercise info:', error);
        }
    }

    static async toggleExerciseDone(id, isDone) {
        try {
            const exercise = await Database.getExercise(id);
            exercise.isDone = isDone;
            await Database.updateExercise(exercise);
            await this.loadExercises();

            if (isDone && deviceSupport.notifications && Notification.permission === 'granted') {
                NotificationManager.showNotification(exercise);
            }
        } catch (error) {
            console.error('Error updating exercise status:', error);
        }
    }

    static async deleteExercise(id) {
        try {
            await Database.deleteExercise(id);
            UI.closeModal('info-exercise-modal');
            await this.loadExercises();
        } catch (error) {
            console.error('Error deleting exercise:', error);
        }
    }
}

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./service-worker.js', {scope: './'})
            .then(() => App.init())
            .catch(err => console.error('ServiceWorker registration failed:', err));
    });
} else {
    window.addEventListener('load', () => App.init());
}