// src/services/authService.js

// A URL base da sua API de autenticação. Ajuste a porta (3001) e o caminho base (/api/auth) conforme o seu backend.
const API_URL = 'https://lista-compras-backend-api-render.onrender.com/auth/'; 

// Função para registrar um novo usuário
const register = async (userData) => {
    // userData deve conter { nome, email, cpf, senha }
    const res = await fetch(API_URL + 'register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
    });

    const data = await res.json(); // A resposta do backend já contém { token, user, message }

    if (res.ok) { // Verifica se o status da resposta é 2xx (sucesso)
        if (data.token) {
            // Se o registro for bem-sucedido e retornar um token, armazene-o no localStorage
            localStorage.setItem('user', JSON.stringify(data));
        }
        return data; // Retorna os dados completos (incluindo user e token)
    } else {
        // Se houver um erro (ex: 400, 409, 500), lança uma exceção com a mensagem de erro do backend
        throw new Error(data.error || 'Erro desconhecido no registro.');
    }
};

// Função para fazer login
const login = async (userData) => {
    // userData deve conter { email, senha }
    const res = await fetch(API_URL + 'login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
    });

    const data = await res.json();

    if (res.ok) {
        if (data.token) {
            localStorage.setItem('user', JSON.stringify(data));
        }
        return data;
    } else {
        throw new Error(data.error || 'Erro desconhecido no login.');
    }
};

// Função para fazer logout
const logout = () => {
    localStorage.removeItem('user'); // Remove o token e dados do usuário do localStorage
};

// Função para atualizar o perfil do usuário
const updateProfile = async (userData, token) => {
    // userData pode conter { nome, email, cpf, senha } - qualquer combinação
    const res = await fetch(API_URL + 'profile', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` // Envia o token no cabeçalho Authorization
        },
        body: JSON.stringify(userData),
    });

    const data = await res.json();

    if (res.ok) {
        // Se a atualização for bem-sucedida, você pode querer atualizar o localStorage
        // com os novos dados do usuário, mantendo o token original
        const currentUserData = JSON.parse(localStorage.getItem('user'));
        const updatedUserData = {
            ...currentUserData, // Mantém o token original e outros dados
            user: data.user // Atualiza apenas os dados do usuário com os retornados pelo backend
        };
        localStorage.setItem('user', JSON.stringify(updatedUserData));
        return updatedUserData; // Retorna os dados completos (token + user atualizado)
    } else {
        throw new Error(data.error || 'Erro desconhecido na atualização do perfil.');
    }
};


const authService = {
    register,
    login,
    logout,
    updateProfile,
};

export default authService;