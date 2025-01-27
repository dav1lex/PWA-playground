class NotificationManager {
    static async requestPermission() {
        const permission = await Notification.requestPermission();
        this.updateButton(permission);
        return permission === 'granted';
    }

    static updateButton(permission) {
        const btn = elements.notificationBtn;
        if (permission === 'granted') {
            btn.classList.add('hidden');
            return;
        }

        const isDenied = permission === 'denied';
        btn.classList.remove('hidden');
        btn.textContent = isDenied ? 'Notificatins Blocked': 'Enable Notifications';
        btn.disabled = isDenied;
        btn.className = `px-4 py-2 rounded ${
            isDenied ? 'bg-gray-400 text-gray-700':'bg-blue-500 text-white hover:bg-blue-600'
        }`;
    }

    static showNotification(exercise) {
        if (Notification.permission !== 'granted') return;

        const options = {
            body: `${exercise.exercise} is completed`,
            icon: `${window.location.origin}/icons/icon-192x192.png`,
            badge: `${window.location.origin}/icons/icon-192x192.png`,
            vibrate: [200],
            tag: 'exercise-completion',
            renotify: true,
            requireInteraction: false,
            silent: false
        };

        navigator.serviceWorker.ready
            .then(registration => registration.showNotification('Exercise done', options))
            .catch(err => console.error('Notification failed:', err));
    }
}