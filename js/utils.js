const deviceSupport = {
    notifications: 'Notification' in window,
    vibration: 'vibrate' in navigator,
};

function createButton(text, onClick, className) {
    const button = document.createElement('button');
    button.textContent = text;
    button.className = `${className} text-white px-3 py-1 rounded`;
    button.addEventListener('click', onClick);
    return button;
}

function createInfoRow(label, value) {
    const p = document.createElement('p');
    const strong = document.createElement('strong');
    strong.textContent = `${label}: `;
    p.appendChild(strong);
    p.appendChild(document.createTextNode(value));
    return p;
}