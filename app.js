const STORAGE_KEYS = {
    session: 'pizzaAppSession',
    messages: 'pizzaAppMessages',
    images: 'pizzaAppImages',
    pizzas: 'pizzaAppPizzas',
    users: 'pizzaAppUsers'
};

const fixedUser = {
    username: 'Mészáros',
    password: 'Tibor',
    firstName: 'Tibor',
    lastName: 'Mészáros',
    email: 'meszaros.tibor@pizza.hu'
};

const defaultPizzas = [
    { id: '1', name: 'Margherita', category: 'főnemes', price: 950, vegetarian: true },
    { id: '2', name: 'Pepperoni', category: 'király', price: 1250, vegetarian: false },
    { id: '3', name: 'Hawaii', category: 'lovag', price: 1150, vegetarian: false },
    { id: '4', name: 'Vegetár', category: 'apród', price: 850, vegetarian: true }
];

const PIZZAS_API = 'pizzas_api.php';

let pizzaCache = [];

function getStorage(key) {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : null;
}

function setStorage(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}

function initApp() {
    if (!getStorage(STORAGE_KEYS.messages)) {
        setStorage(STORAGE_KEYS.messages, []);
    }
    if (!getStorage(STORAGE_KEYS.images)) {
        setStorage(STORAGE_KEYS.images, []);
    }
    if (!getStorage(STORAGE_KEYS.users)) {
        setStorage(STORAGE_KEYS.users, []);
    }

    updateNavUI();

    const messagesTable = document.getElementById('messages-table');
    if (messagesTable && !getCurrentUser()) {
        alert('Az üzenetek oldalt csak bejelentkezés után tekintheti meg.');
        window.location.href = 'auth.html';
        return;
    }

    renderPizzas();
    renderImages();
    renderMessages();
}

function getCurrentUser() {
    return getStorage(STORAGE_KEYS.session);
}
