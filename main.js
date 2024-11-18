const dbRequest = indexedDB.open('ExpenseTrackerDB', 1);
let db;

const expenseForm = document.getElementById('expense-form');
const amountInput = document.getElementById('amount');
const categoryInput = document.getElementById('category');
const dateInput = document.getElementById('date');
const expensesList = document.getElementById('expenses');
const totalDisplay = document.getElementById('total');

//automatically set today's date into input
document.addEventListener('DOMContentLoaded', () => {
    const dateInput = document.getElementById('date');
    dateInput.value = new Date().toISOString().split('T')[0];
});

dbRequest.onupgradeneeded = (event) => {
    db = event.target.result;
    const objectStore = db.createObjectStore('expenses', {keyPath: 'id', autoIncrement: true});
    objectStore.createIndex('category', 'category', {unique: false});
    objectStore.createIndex('amount', 'amount', {unique: false});
    objectStore.createIndex('date', 'date', {unique: false});
};

dbRequest.onsuccess = (event) => {
    db = event.target.result;
    console.log('Database opened successfully');
    renderExpenses(); // Render expenses on DB connection
};

dbRequest.onerror = (event) => {
    console.error('Database error:', event.target.errorCode);
};

document.addEventListener('DOMContentLoaded', () => {
    updateNetworkStatus();
    expenseForm.addEventListener('submit', addExpense);
    window.addEventListener('online', updateNetworkStatus);
    window.addEventListener('offline', updateNetworkStatus);
});

function updateTotal() {
    const transaction = db.transaction('expenses', 'readonly');
    const objectStore = transaction.objectStore('expenses');
    const getAllRequest = objectStore.getAll();

    getAllRequest.onsuccess = () => {
        const expenses = getAllRequest.result;
        const total = expenses.reduce((acc, expense) => acc + expense.amount, 0);
        totalDisplay.textContent = total.toFixed(2);
    };
}

function renderExpenses() {
    expensesList.innerHTML = '';
    const transaction = db.transaction('expenses', 'readonly');
    const objectStore = transaction.objectStore('expenses');
    const getAllRequest = objectStore.getAll();

    getAllRequest.onsuccess = () => {
        const expenses = getAllRequest.result;
        expenses.forEach((expense) => {
            const li = document.createElement('li');
            li.classList.add('flex', 'justify-between', 'items-center', 'mb-2');
            li.innerHTML = `
                <span>${expense.category}: $${expense.amount.toFixed(2)} on ${expense.date} in ${expense.location.city || 'Unknown Location'}</span>
            `;

            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Delete';
            deleteButton.classList.add('bg-red-500', 'text-white', 'py-1', 'px-2', 'rounded', 'hover:bg-red-600');
            deleteButton.addEventListener('click', () => deleteExpense(expense.id)); // Attach event handler

            li.appendChild(deleteButton);
            expensesList.appendChild(li);
        });
        updateTotal();
    };
}

function deleteExpense(id) {
    const transaction = db.transaction('expenses', 'readwrite');
    const objectStore = transaction.objectStore('expenses');

    // Delete the expense by its ID
    const deleteRequest = objectStore.delete(id);

    deleteRequest.onsuccess = () => {
        console.log(`Expense with id ${id} deleted.`);
        renderExpenses(); // Re-render
    };

    deleteRequest.onerror = (event) => {
        console.error('Delete failed', event.target.errorCode);
    };
}

function addExpense(e) {
    e.preventDefault();

    const amount = parseFloat(amountInput.value);
    const category = categoryInput.value;
    const date = dateInput.value;

    if (!amount || !category || !date) {
        console.error('Please fill in all fields');
        return;
    }

    const expense = {amount, category, date};

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const latitude = position.coords.latitude;
                const longitude = position.coords.longitude;

                const city = await fetchCityName(latitude, longitude);
                expense.location = {latitude, longitude, city};

                saveExpenseToDB(expense);
            },
            (error) => {
                console.warn('Geolocation not available or denied:', error.message);
                expense.location = {latitude: null, longitude: null, city: 'Unknown Location'};

                saveExpenseToDB(expense);
            }
        );
    } else {
        console.warn('Geolocation is not supported by this browser');
        expense.location = {latitude: null, longitude: null, city: 'Unknown Location'};

        saveExpenseToDB(expense);
    }
}

function saveExpenseToDB(expense) {
    const transaction = db.transaction('expenses', 'readwrite');
    const objectStore = transaction.objectStore('expenses');

    const addRequest = objectStore.add(expense);

    addRequest.onsuccess = () => {
        console.log('Expense added:', expense);
        renderExpenses(); // Re-render
    };

    addRequest.onerror = (event) => {
        console.error('Failed to save expense:', event.target.errorCode);
    };

    // Clear the fields
    amountInput.value = '';
    categoryInput.value = '';
    dateInput.value = '';
}

function updateNetworkStatus() {
    const statusText = document.getElementById('status-text');
    if (navigator.onLine) {
        statusText.textContent = 'You are online';
        statusText.classList.remove('text-red-500');
        statusText.classList.add('text-green-500');
    } else {
        statusText.textContent = 'You are offline';
        statusText.classList.remove('text-green-500');
        statusText.classList.add('text-red-500');
    }
}

function requestNotificationPermission() {
    if ('Notification' in window && navigator.serviceWorker) {
        Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
                navigator.serviceWorker.ready.then(registration => {
                    registration.showNotification('Welcome to Expense Tracker!', {
                        body: 'Log your expenses daily to stay on top of your finances!',
                        icon: '/icons/icon-192x192.png',
                    });
                });
            }
        });
    }
}

function fetchCityName(latitude, longitude) {
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`;

    return fetch(url)
        .then(response => response.json())
        .then(data => {
            if (data && data.address) {
                return data.address.city || data.address.town || data.address.village || 'Unknown Location';
            } else {
                console.warn('Reverse geocoding response does not contain city information');
                return 'Unknown Location';
            }
        })
        .catch(error => {
            console.error('Failed to fetch city name:', error);
            return 'Unknown Location';
        });
}

document.addEventListener('DOMContentLoaded', () => {
    updateNetworkStatus();
    expenseForm.addEventListener('submit', addExpense);
    requestNotificationPermission(); // Request permission on app load
    window.addEventListener('online', updateNetworkStatus);
    window.addEventListener('offline', updateNetworkStatus);
});
document.getElementById('view-summary').addEventListener('click', () => {
    const transaction = db.transaction('expenses', 'readonly');
    const objectStore = transaction.objectStore('expenses');
    const getAllRequest = objectStore.getAll();

    getAllRequest.onsuccess = () => {
        const expenses = getAllRequest.result;
        const summaryList = document.getElementById('summary-list');
        summaryList.innerHTML = '';

        const categoryTotals = expenses.reduce((totals, expense) => {
            if (!totals[expense.category]) {
                totals[expense.category] = 0;
            }
            totals[expense.category] += expense.amount;
            return totals;
        }, {});

        for (const [category, total] of Object.entries(categoryTotals)) {
            const li = document.createElement('li');
            li.textContent = `${category}: $${total.toFixed(2)}`;
            summaryList.appendChild(li);
        }

        document.getElementById('summary-view').classList.remove('hidden');
    };
});

document.getElementById('close-summary').addEventListener('click', () => {
    document.getElementById('summary-view').classList.add('hidden');
});