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

function editPizza(pizzaId) {
    const pizza = pizzaCache.find(p => String(p.id) === String(pizzaId));
    if (pizza) {
        showCrudForm(true, pizza);
    }
}

function deletePizza(pizzaId) {
    if (!confirm('Biztosan törli a pizzát?')) return;
    fetch(PIZZAS_API, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id: Number(pizzaId) })
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
        .then(() => renderPizzas())
        .catch(error => {
            alert(`Hiba: ${error.message}`);
        });
}

function renderImages() {
    const grid = document.getElementById('images-grid');
    if (!grid) return;
    const images = getStorage(STORAGE_KEYS.images) || [];
    grid.innerHTML = '';

    if (!images.length) {
        grid.innerHTML = '<div class="card"><p>Nincsenek feltöltött képek még. Jelentkezzen be és töltsön fel egy fényképet.</p></div>';
        return;
    }

    images.forEach(image => {
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
            <img src="${image.data}" alt="Feltöltött pizza kép">
            <h3>${image.name}</h3>
            <p>Feltöltve: ${new Date(image.uploadedAt).toLocaleString()}</p>
        `;
        grid.appendChild(card);
    });
}

function handleImageUpload(event) {
    event.preventDefault();
    if (!getCurrentUser()) {
        alert('Képet csak bejelentkezett felhasználó tölthet fel.');
        window.location.href = 'auth.html';
        return;
    }
    const fileInput = document.getElementById('image-input');
    const file = fileInput.files[0];

    if (!file) {
        alert('Válasszon ki egy képfájlt.');
        return;
    }
    if (!file.type.startsWith('image/')) {
        alert('Csak képfájlokat tölthet fel.');
        return;
    }

    const reader = new FileReader();
    reader.onload = function () {
        const images = getStorage(STORAGE_KEYS.images) || [];
        images.push({
            name: file.name,
            data: reader.result,
            uploadedAt: Date.now()
        });
        setStorage(STORAGE_KEYS.images, images);
        renderImages();
        fileInput.value = '';
        alert('A kép feltöltése sikeres.');
    };
    reader.readAsDataURL(file);
}

function handleContactSubmit(event) {
    event.preventDefault();
    const name = document.getElementById('contact-name').value.trim();
    const email = document.getElementById('contact-email').value.trim();
    const subject = document.getElementById('contact-subject').value.trim();
    const message = document.getElementById('contact-message').value.trim();
    const currentUser = getCurrentUser();
    const senderName = currentUser ? `${currentUser.lastName} ${currentUser.firstName}` : 'Vendég';
    
    // Kliens-oldali validáció
    const errors = [];

    if (!name || !email || !subject || !message) {
        errors.push('Minden mező kitöltése kötelező.');
    }
    if (!validateEmail(email)) {
        errors.push('Érvényes email címet adjon meg.');
    }

    const errorBox = document.getElementById('contact-errors');
    const successBox = document.getElementById('contact-success');
    
    if (errors.length) {
        errorBox.innerHTML = errors.map(msg => `<p class="error">${msg}</p>`).join('');
        errorBox.style.display = 'block';
        successBox.style.display = 'none';
        return;
    }

    // Küldés szerverre AJAX-al
    errorBox.style.display = 'none';
    successBox.style.display = 'none';
    
    // Töltés jelzés
    const submitBtn = event.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Küldés folyamatban...';
    submitBtn.disabled = true;

    fetch('process_contact.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            name: senderName,
            email: email,
            subject: subject,
            message: message
        })
    })
    .then(async response => {
        const responseText = await response.text();
        let data;

        try {
            data = JSON.parse(responseText);
        } catch (parseError) {
            throw new Error(`Válasz nem JSON: ${responseText}`);
        }

        if (!response.ok) {
            throw new Error(data.error || `Szerverhiba (${response.status})`);
        }

        return data;
    })
    .then(data => {
        if (data.success) {
            // Siker
            successBox.style.display = 'block';
            errorBox.style.display = 'none';
            document.querySelector('form.form').reset();
            
            // LocalStorage-ba is mentjük
            const messages = getStorage(STORAGE_KEYS.messages) || [];
            messages.push({
                name: senderName,
                email: email,
                subject: subject,
                message: message,
                createdAt: Date.now()
            });
            setStorage(STORAGE_KEYS.messages, messages);
            renderMessages();
        } else {
            // Hiba
            if (data.error && Array.isArray(data.error)) {
                errorBox.innerHTML = data.error.map(msg => `<p class="error">${msg}</p>`).join('');
            } else {
                errorBox.innerHTML = `<p class="error">${data.error || 'Ismeretlen hiba'}</p>`;
            }
            errorBox.style.display = 'block';
            successBox.style.display = 'none';
        }
    })
    .catch(error => {
        console.error('Hiba:', error);
        errorBox.innerHTML = `<p class="error">Hálózati hiba: ${error.message}</p>`;
        errorBox.style.display = 'block';
        successBox.style.display = 'none';
    })
    .finally(() => {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    });
}

function renderMessages() {
    const tbody = document.getElementById('messages-tbody');
    const noMessages = document.getElementById('no-messages');
    if (!tbody) return;

    fetch('get_messages.php')
        .then(response => response.json())
        .then(data => {
            tbody.innerHTML = '';
            if (!data.messages || !data.messages.length) {
                noMessages.style.display = 'block';
                return;
            }
            noMessages.style.display = 'none';
            data.messages.forEach(msg => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${msg.name || 'Vendég'}</td>
                    <td>${msg.email}</td>
                    <td>${msg.message}</td>
                    <td>${msg.created_at}</td>
                `;
                tbody.appendChild(tr);
            });
        })
        .catch(() => {
            noMessages.textContent = 'Hiba az üzenetek betöltésekor.';
            noMessages.style.display = 'block';
        });
}

window.initApp = initApp;
window.showPage = showPage;
window.handleLogin = handleLogin;
window.handleRegister = handleRegister;
window.logout = logout;
window.showCrudForm = showCrudForm;
window.hideCrudForm = hideCrudForm;
window.handlePizzaSubmit = handlePizzaSubmit;
window.editPizza = editPizza;
window.deletePizza = deletePizza;
window.handleImageUpload = handleImageUpload;
window.handleContactSubmit = handleContactSubmit;

window.addEventListener('hashchange', () => {
    const page = window.location.hash.replace('#', '') || 'home';
    showPage(page);
});
