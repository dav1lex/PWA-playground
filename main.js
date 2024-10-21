const dbRequest = indexedDB.open('ExpenseTrackerDB', 1);
let db;

const expenseForm = document.getElementById('expense-form');
const amountInput = document.getElementById('amount');
const categoryInput = document.getElementById('category');
const dateInput = document.getElementById('date');
const expensesList = document.getElementById('expenses');
const totalDisplay = document.getElementById('total');

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
                <span>${expense.category}: $${expense.amount.toFixed(2)} on ${expense.date}</span>
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
    console.log('Form submitted');  // when the form is submitted

    const amount = parseFloat(amountInput.value);
    const category = categoryInput.value;
    const date = dateInput.value;

    if (!amount || !category || !date) {
        console.error('Please fill in all fields');  // Log if fields are empty
        return;
    }

    const expense = {amount, category, date};

    const transaction = db.transaction('expenses', 'readwrite');
    const objectStore = transaction.objectStore('expenses');

    const addRequest = objectStore.add(expense);

    addRequest.onsuccess = () => {
        console.log('Expense added:', expense);
        renderExpenses();
    };

    addRequest.onerror = (event) => {
        console.error('Add failed:', event.target.errorCode);  // Log if there's an error
    };

    // Clear the input fields
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
