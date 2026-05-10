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

function updateNavUI() {
    const user = getCurrentUser();
    const loginBtn = document.getElementById('login-btn');
    const logoutBtn = document.getElementById('logout-btn');
    const messagesLink = document.getElementById('messages-link');
    const userInfo = document.getElementById('user-info');
    const uploadSection = document.getElementById('upload-section');

    const loginNotice = document.getElementById('login-notice');
    if (user) {
        loginBtn.style.display = 'none';
        logoutBtn.style.display = 'inline-block';
        messagesLink.style.display = 'inline-block';
        userInfo.style.display = 'inline-block';
        userInfo.textContent = `Bejelentkezett: ${user.lastName} ${user.firstName} (${user.username})`;
        if (uploadSection) uploadSection.style.display = 'block';
        if (loginNotice) loginNotice.style.display = 'none';
    } else {
        loginBtn.style.display = 'inline-block';
        logoutBtn.style.display = 'none';
        messagesLink.style.display = 'none';
        userInfo.style.display = 'none';
        if (uploadSection) uploadSection.style.display = 'none';
        if (loginNotice) loginNotice.style.display = 'block';
    }
}

function showPage(page) {
    const pages = document.querySelectorAll('.page');
    pages.forEach((element) => {
        element.style.display = 'none';
    });

    const target = document.getElementById(`${page}-page`);
    if (target) {
        target.style.display = 'block';
        window.location.hash = page;
    } else {
        document.getElementById('home-page').style.display = 'block';
        window.location.hash = 'home';
    }

    if (page === 'messages' && !getCurrentUser()) {
        showPage('auth');
        alert('Az üzenetek megtekintéséhez jelentkezzen be.');
    }

    if (page === 'auth') {
        showTab('login');
    }
}

function showTab(tab) {
    const tabs = document.querySelectorAll('.tab-btn');
    const contents = document.querySelectorAll('.tab-content');

    tabs.forEach(button => {
        button.classList.toggle('active', button.textContent.trim() === (tab === 'login' ? 'Bejelentkezés' : 'Regisztráció'));
    });

    contents.forEach(content => {
        content.classList.toggle('active', content.id === tab);
    });
}

function handleLogin(event) {
    event.preventDefault();
    const username = document.getElementById('login-username').value.trim();
    const password = document.getElementById('login-password').value;
    const errors = [];

    if (!username || !password) {
        errors.push('Mindkét mező kitöltése kötelező.');
    }

    const users = getStorage(STORAGE_KEYS.users) || [];
    const registeredUser = users.find(u => u.username === username && u.password === btoa(password));
    const isFixedUser = username === fixedUser.username && password === fixedUser.password;

    if (!isFixedUser && !registeredUser) {
        errors.push('Hibás felhasználónév vagy jelszó.');
    }

    const errorBox = document.getElementById('login-errors');
    if (errors.length) {
        errorBox.innerHTML = errors.map(msg => `<p class="error">${msg}</p>`).join('');
        errorBox.style.display = 'block';
        return;
    }

    errorBox.style.display = 'none';
    const activeUser = isFixedUser ? fixedUser : registeredUser;
    setStorage(STORAGE_KEYS.session, {
        username: activeUser.username,
        firstName: activeUser.firstName,
        lastName: activeUser.lastName,
        email: activeUser.email
    });
    updateNavUI();
    alert('Sikeres bejelentkezés!');
    window.location.href = 'index.html';
}

function handleRegister(event) {
    event.preventDefault();
    const username = document.getElementById('reg-username').value.trim();
    const email = document.getElementById('reg-email').value.trim();
    const firstName = document.getElementById('reg-firstname').value.trim();
    const lastName = document.getElementById('reg-lastname').value.trim();
    const password = document.getElementById('reg-password').value;
    const passwordConfirm = document.getElementById('reg-password-confirm').value;
    const errors = [];

    if (!username || !email || !firstName || !lastName || !password || !passwordConfirm) {
        errors.push('Minden mező kitöltése kötelező.');
    }
    if (password !== passwordConfirm) {
        errors.push('A jelszavak nem egyeznek.');
    }
    if (!validateEmail(email)) {
        errors.push('Érvényes email címet adjon meg.');
    }

    const users = getStorage(STORAGE_KEYS.users) || [];
    if (users.some(u => u.username === username)) {
        errors.push('A felhasználónév már foglalt.');
    }
    if (users.some(u => u.email === email)) {
        errors.push('Ez az email cím már regisztrálva van.');
    }

    const errorBox = document.getElementById('register-errors');
    if (errors.length) {
        errorBox.innerHTML = errors.map(msg => `<p class="error">${msg}</p>`).join('');
        errorBox.style.display = 'block';
        return;
    }

    errorBox.style.display = 'none';
    users.push({
        username,
        email,
        firstName,
        lastName,
        password: btoa(password)
    });
    setStorage(STORAGE_KEYS.users, users);

    alert('Sikeres regisztráció! Most jelentkezzen be.');
    showTab('login');
}

function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function logout() {
    localStorage.removeItem(STORAGE_KEYS.session);
    updateNavUI();
    showPage('home');
    alert('Sikeresen kijelentkezett.');
}

function showCrudForm(editMode = false, pizza = null) {
    const formContainer = document.getElementById('crud-form');
    formContainer.style.display = 'block';
    if (editMode && pizza) {
        document.getElementById('pizza-id').value = pizza.id;
        document.getElementById('pizza-name').value = pizza.name;
        document.getElementById('pizza-category').value = pizza.category;
        document.getElementById('pizza-vego').checked = pizza.vegetarian;
    } else {
        document.getElementById('pizza-id').value = '';
        document.getElementById('pizza-name').value = '';
        document.getElementById('pizza-category').value = '';
        document.getElementById('pizza-vego').checked = false;
    }
}

function hideCrudForm() {
    document.getElementById('crud-form').style.display = 'none';
}

function handlePizzaSubmit(event) {
    event.preventDefault();
    const id = document.getElementById('pizza-id').value;
    const name = document.getElementById('pizza-name').value.trim();
    const category = document.getElementById('pizza-category').value;
    const vegetarian = document.getElementById('pizza-vego').checked;
    const errors = [];

    if (!name || !category) {
        errors.push('A pizza neve és kategóriája kötelező.');
    }

    if (errors.length) {
        alert(errors.join('\n'));
        return;
    }

    fetch(PIZZAS_API, {
        method: id ? 'PUT' : 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            id: id ? Number(id) : undefined,
            name,
            category,
            vegetarian
        })
    })
        .then(async response => {
            const text = await response.text();
            let data;
            try {
                data = JSON.parse(text);
            } catch (error) {
                throw new Error(`Válasz nem JSON: ${text}`);
            }

            if (!response.ok) {
                throw new Error(data.error || `Szerverhiba (${response.status})`);
            }

            return data;
        })
        .then(() => {
            renderPizzas();
            hideCrudForm();
            alert(id ? 'A pizza módosítva lett.' : 'A pizza hozzáadva lett.');
        })
        .catch(error => {
            alert(`Hiba: ${error.message}`);
        });
}

async function renderPizzas() {
    const tbody = document.getElementById('pizzas-tbody');
    if (!tbody) return;

    try {
        const response = await fetch(PIZZAS_API);
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error || 'Nem sikerült betölteni a pizzákat.');
        }

        pizzaCache = data.pizzas || [];
        tbody.innerHTML = '';

        if (!pizzaCache.length) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;">Nincsenek pizzák az adatbázisban.</td></tr>';
            return;
        }

        pizzaCache.forEach(pizza => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${pizza.name}</td>
                <td>${pizza.category}</td>
                <td>${pizza.price} Ft</td>
                <td>${pizza.vegetarian ? 'Igen' : 'Nem'}</td>
                <td>
                    <div class="action-btns">
                        <button class="btn-edit" onclick='editPizza("${pizza.id}")'>Szerkesztés</button>
                        <button class="btn-delete" onclick='deletePizza("${pizza.id}")'>Törlés</button>
                    </div>
                </td>
            `;
            tbody.appendChild(tr);
        });
    } catch (error) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;">Hiba a pizzák betöltésekor: ${error.message}</td></tr>`;
    }
}
