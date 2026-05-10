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
