// src/pages/ForgotPasswordPage.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useModal } from '../context/ModalContext'; // Para showAlert

function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const { theme, themes } = useTheme(); // Para estilização
    const { showAlert } = useModal(); // Para exibir alertas

    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        setError('');

        // Validação básica do email
        if (!email.trim()) {
            setError('Por favor, informe seu e-mail.');
            setLoading(false);
            return;
        }

        try {
            // Chamada ao backend para solicitar a redefinição
            // Esta rota será criada no BACKEND no PRÓXIMO PASSO
            const response = await fetch('https://lista-compras-backend-api-render.onrender.com/auth/forgot-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (response.ok) {
                setMessage(data.message || 'Um link para redefinição de senha foi enviado para o seu e-mail.');
                // Opcional: Redirecionar após sucesso, ou apenas exibir a mensagem
                // navigate('/login'); 
            } else {
                setError(data.error || 'Erro ao solicitar redefinição de senha.');
                showAlert(data.error || 'Erro ao solicitar redefinição de senha.');
            }
        } catch (err) {
            console.error("Erro na requisição de forgot-password:", err);
            setError('Erro de conexão. Tente novamente mais tarde.');
            showAlert('Erro de conexão. Tente novamente mais tarde.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center"
             style={{
                 backgroundColor: themes[theme].primaryColor,
                 color: themes[theme].textColor,
                 backgroundImage: themes[theme].backgroundImage,
                 backgroundSize: "cover", backgroundRepeat: "no-repeat", backgroundPosition: "center"
             }}>
            <div className="p-8 rounded-lg shadow-lg w-full max-w-sm"
                 style={{ backgroundColor: themes[theme].primaryColor, color: themes[theme].textColor, borderColor: themes[theme].accentColor, borderWidth: '1px' }}>
                <h2 className="text-2xl font-bold mb-6 text-center">Esqueci Minha Senha</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input
                        type="email"
                        placeholder="Seu e-mail"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2"
                        style={{
                            backgroundColor: themes[theme].selectBackgroundColor,
                            color: themes[theme].selectTextColor,
                            borderColor: themes[theme].accentColor,
                            '--tw-ring-color': themes[theme].accentColor
                        }}
                    />

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-2 rounded-md hover:brightness-110 transition duration-200"
                        style={{
                            backgroundColor: themes[theme].accentColor,
                            color: themes[theme].textColor,
                        }}
                    >
                        {loading ? 'Enviando...' : 'Redefinir Senha'}
                    </button>

                    {message && <p className="text-green-500 text-sm text-center">{message}</p>}
                    {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                </form>
                <p className="mt-6 text-center">
                    Lembrou da senha?{' '}
                    <Link to="/login" className="text-blue-600 hover:underline"
                          style={{ color: themes[theme].accentColor }}>
                        Fazer Login
                    </Link>
                </p>
            </div>
        </div>
    );
}

export default ForgotPasswordPage;