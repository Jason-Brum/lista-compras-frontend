// src/context/AuthContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import authService from '../services/authService'; // Importe o serviço de autenticação

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null); // Guarda informações do usuário logado (com token)
    const [loading, setLoading] = useState(true); // Indica se o carregamento inicial está ocorrendo
    const [error, setError] = useState(null); // Para armazenar erros de autenticação

    useEffect(() => {
        // Ao carregar a aplicação, tenta carregar o usuário do localStorage
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                const parsedUser = JSON.parse(storedUser);
                // Verifica se o token e o usuário estão presentes
                // Aqui você pode adicionar validações adicionais, como verificar se o token é válido
                // Por simplicidade, vamos apenas setar o usuário se o token existir.
                if (parsedUser.token && parsedUser.user) {
                    setUser(parsedUser);
                } else {
                    localStorage.removeItem('user'); // Limpa se estiver corrompido
                }
            } catch (e) {
                console.error("Erro ao fazer parse do usuário do localStorage:", e);
                localStorage.removeItem('user');
            }
        }
        setLoading(false); // Carregamento inicial concluído
    }, []);

    // Função de login
    const login = async (credentials) => {
        // credentials deve conter { email, senha }
        setLoading(true);
        setError(null);
        try {
            const data = await authService.login(credentials);
            setUser(data); // data já contém { token, user }
            return data;
        } catch (err) {
            setError(err.message);
            setUser(null);
            throw err; // Re-lança o erro para o componente que chamou
        } finally {
            setLoading(false);
        }
    };

    // Função de registro
    const register = async (userData) => {
        // userData deve conter { nome, email, cpf, senha }
        setLoading(true);
        setError(null);
        try {
            const data = await authService.register(userData);
            setUser(data); // data já contém { token, user }
            return data;
        } catch (err) {
            setError(err.message);
            setUser(null);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // Função de logout
    const logout = () => {
        authService.logout();
        setUser(null);
        setError(null);
        // Redirecionar para a página de login pode ser feito no componente que chama logout
    };

    // Função para atualizar perfil
    const updateProfile = async (userData) => {
        setLoading(true);
        setError(null);
        try {
            if (!user || !user.token) {
                throw new Error('Usuário não autenticado. Impossível atualizar perfil.');
            }
            const updatedData = await authService.updateProfile(userData, user.token);
            setUser(updatedData); // updatedData já contém { token, user atualizado }
            return updatedData;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthContext.Provider value={{ 
            user, 
            loading, 
            error, 
            login, 
            register, 
            logout,
            updateProfile, // Adiciona a função de atualização
            isAuthenticated: !!user && !!user.token // Verifica se user e token existem
        }}>
            {children}
        </AuthContext.Provider>
    );
};

// Hook customizado para usar o AuthContext mais facilmente
export const useAuth = () => {
    return useContext(AuthContext);
};