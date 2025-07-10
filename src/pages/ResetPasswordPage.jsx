// src/pages/ResetPasswordPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useModal } from '../context/ModalContext'; // Para showAlert

function ResetPasswordPage() {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const { token } = useParams(); // <-- Pega o token da URL (ex: /reset-password/SEUTOKEN)
    const navigate = useNavigate();
    const { theme, themes } = useTheme(); // Para estilização
    const { showAlert } = useModal(); // Para exibir alertas

    useEffect(() => {
        // Validação inicial do token (opcional aqui, a validação principal é no backend)
        if (!token) {
            setError('Token de redefinição de senha não encontrado.');
            showAlert('Token de redefinição de senha não encontrado. Por favor, use o link completo do e-mail.');
            setLoading(false); // Garante que o loading não fique travado
        }
    }, [token, showAlert]); // Roda quando o token da URL muda

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        setError('');

        if (!password || password.length < 6) {
            setError('A nova senha deve ter pelo menos 6 caracteres.');
            setLoading(false);
            return;
        }

        if (password !== confirmPassword) {
            setError('As senhas não coincidem.');
            setLoading(false);
            return;
        }

        try {
            // Chamada ao backend para redefinir a senha
            const response = await fetch(`http://localhost:3001/auth/reset-password/${token}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ newPassword: password }), // Enviar a nova senha
            });

            const data = await response.json();

            if (response.ok) {
                setMessage(data.message || 'Senha redefinida com sucesso! Você pode fazer login agora.');
                await showAlert(data.message || 'Senha redefinida com sucesso! Você pode fazer login agora.');
                navigate('/login'); // Redireciona para a página de login após sucesso
            } else {
                setError(data.error || 'Erro ao redefinir senha.');
                await showAlert(data.error || 'Erro ao redefinir senha.');
            }
        } catch (err) {
            console.error("Erro na requisição de reset-password:", err);
            setError('Erro de conexão. Tente novamente mais tarde.');
            await showAlert('Erro de conexão. Tente novamente mais tarde.');
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
                <h2 className="text-2xl font-bold mb-6 text-center">Redefinir Senha</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input
                        type="password"
                        placeholder="Nova Senha"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2"
                        style={{
                            backgroundColor: themes[theme].selectBackgroundColor,
                            color: themes[theme].selectTextColor,
                            borderColor: themes[theme].accentColor,
                            '--tw-ring-color': themes[theme].accentColor
                        }}
                    />
                    <input
                        type="password"
                        placeholder="Confirmar Nova Senha"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
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
                        {loading ? 'Redefinindo...' : 'Redefinir Senha'}
                    </button>

                    {message && <p className="text-green-500 text-sm text-center">{message}</p>}
                    {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                </form>
                <p className="mt-6 text-center">
                    <Link to="/login" className="text-blue-600 hover:underline"
                          style={{ color: themes[theme].accentColor }}>
                        Voltar ao Login
                    </Link>
                </p>
            </div>
        </div>
    );
}

export default ResetPasswordPage;