class UI {
    static closeModal(modalId) {
        document.getElementById(modalId).classList.remove('show');
        document.getElementById(modalId).classList.add('hidden');
    }

    static createExerciseElement(exercise) {
        const div = document.createElement('div');
        div.className = `exercise-item ${exercise.isDone ? 'done' : ''}`;

        const content = document.createElement('div');
        content.className = 'exercise-content';

        const title = document.createElement('h3');
        title.textContent = exercise.exercise;
        title.className = 'font-bold text-lg';

        const details = document.createElement('p');
        details.textContent = `Sets: ${exercise.sets} × Reps: ${exercise.reps}`;

        const actions = document.createElement('div');
        actions.className = 'flex gap-2 mt-2';

        const editBtn = createButton('Edit', () => App.showEditForm(exercise.id), 'bg-blue-500');
        const infoBtn = createButton('Info', () => App.showExerciseInfo(exercise.id), 'bg-gray-500');

        actions.appendChild(editBtn);
        actions.appendChild(infoBtn);

        content.appendChild(title);
        content.appendChild(details);
        div.appendChild(content);
        div.appendChild(actions);

        return div;
    }

    static displayExercises(exercises) {
        const container = elements.exerciseList;
        container.textContent = '';

        CONFIG.DAYS.forEach(day => {
            const dayExercises = exercises.filter(ex => ex.weekday === day);
            if (dayExercises.length > 0) {
                const section = document.createElement('div');
                section.className = 'mb-6';

                const heading = document.createElement('h2');
                heading.className = 'text-xl font-bold mb-3';
                heading.textContent = day;

                section.appendChild(heading);

                dayExercises.forEach(exercise => {
                    section.appendChild(this.createExerciseElement(exercise));
                });

                container.appendChild(section);
            }
        });
    }

    static updateOnlineStatus() {
        const status = navigator.onLine ? 'Online' : 'Offline';
        const color = navigator.onLine ? 'text-green-500' : 'text-red-500';
        elements.statusText.textContent = status;
        elements.statusText.className = color;
    }
}