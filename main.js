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
    const objectStore = db.createObjectStore('expenses', { keyPath: 'id', autoIncrement: true });
    objectStore.createIndex('category', 'category', { unique: false });
    objectStore.createIndex('amount', 'amount', { unique: false });
    objectStore.createIndex('date', 'date', { unique: false });
};

dbRequest.onsuccess = (event) => {
    db = event.target.result;
    console.log('Database opened successfully');
    renderExpenses(); // Render expenses on successful DB connection
};

dbRequest.onerror = (event) => {
    console.error('Database error:', event.target.errorCode);
};

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
            li.textContent = `${expense.category}: $${expense.amount.toFixed(2)} on ${expense.date}`;
            expensesList.appendChild(li);
        });
        updateTotal();
    };
}

function addExpense(e) {
    e.preventDefault();
    console.log('Form submitted');

    const amount = parseFloat(amountInput.value);
    const category = categoryInput.value;
    const date = dateInput.value;

    const expense = { amount, category, date };

    const transaction = db.transaction('expenses', 'readwrite');
    const objectStore = transaction.objectStore('expenses');
    objectStore.add(expense);

    amountInput.value = '';
    categoryInput.value = '';
    dateInput.value = '';

    renderExpenses();
}

expenseForm.addEventListener('submit', addExpense);
