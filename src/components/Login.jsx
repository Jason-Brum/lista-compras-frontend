import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Input from "./Input"; // Seus componentes de Input
import Button from "./Button"; // Seus componentes de Button
import { useTheme } from "../context/ThemeContext";
import { Eye, EyeOff } from "lucide-react";

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [rememberMe, setRememberMe] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const { login, loading, error } = useAuth();
    const navigate = useNavigate();
    const { theme, themes } = useTheme();

    useEffect(() => {
        const savedEmail = localStorage.getItem("rememberedEmail");
        if (savedEmail) {
            setEmail(savedEmail);
            setRememberMe(true);
        }
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const userData = await login({ email, senha: password });

            if (userData) {
                if (rememberMe) {
                    localStorage.setItem("rememberedEmail", email);
                } else {
                    localStorage.removeItem("rememberedEmail");
                }
                navigate("/");
            }
        } catch (err) {
            console.error("Erro de login no componente:", err.message);
        }
    };

    const togglePasswordVisibility = () => {
        setShowPassword((prev) => !prev);
    };

    return (
        <div
            className="min-h-screen flex items-center justify-center"
            style={{
                backgroundColor: themes[theme].primaryColor,
                color: themes[theme].textColor,
                backgroundImage: themes[theme].backgroundImage,
                backgroundSize: "cover",
                backgroundRepeat: "no-repeat",
                backgroundPosition: "center",
            }}
        >
            <div
                className="p-8 rounded-lg shadow-lg w-full max-w-sm"
                style={{
                    backgroundColor: themes[theme].primaryColor,
                    color: themes[theme].textColor,
                    borderColor: themes[theme].accentColor,
                    borderWidth: "1px",
                }}
            >
                <h2 className="text-2xl font-bold mb-6 text-center">Entrar</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2"
                        style={{
                            backgroundColor: themes[theme].selectBackgroundColor,
                            color: themes[theme].selectTextColor,
                            borderColor: themes[theme].accentColor,
                            '--tw-ring-color': themes[theme].accentColor,
                        }}
                    />
                    {/* CAMPO DE SENHA COM ÍCONE DE OLHO - SOLUÇÃO REVISADA E SIMPLIFICADA */}
                    <div className="relative">
                        <Input
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Senha"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            // Input tem border-radius completo e padding
                            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 pr-10" // pr-10 para espaço do ícone
                            style={{
                                backgroundColor: themes[theme].selectBackgroundColor,
                                color: themes[theme].selectTextColor,
                                borderColor: themes[theme].accentColor,
                                '--tw-ring-color': themes[theme].accentColor,
                            }}
                        />
                        <button
                            type="button"
                            onClick={togglePasswordVisibility}
                            // Botão do olho: Posicionamento absoluto, sem borda própria, com background para cobrir o input
                            // e border-radius apenas no canto direito para harmonizar
                            className="absolute inset-y-0 right-0 pr-3 flex items-center rounded-r-md" // <-- MUDANÇA: rounded-r-md
                            style={{
                                color: themes[theme].selectTextColor,
                                backgroundColor: themes[theme].selectBackgroundColor, // <-- MESMA COR DO INPUT
                                // Garante que a borda direita do botão case com a do input
                                borderColor: themes[theme].accentColor, 
                                borderWidth: '1px',
                                borderLeftWidth: '0px', // Remove a borda esquerda para evitar linha
                            }}
                        >
                            {showPassword ? (
                                <EyeOff size={20} />
                            ) : (
                                <Eye size={20} />
                            )}
                        </button>
                    </div>

                    {/* Checkbox Lembrar-me */}
                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            id="rememberMe"
                            checked={rememberMe}
                            onChange={(e) => setRememberMe(e.target.checked)}
                            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            style={{ borderColor: themes[theme].accentColor, backgroundColor: themes[theme].selectBackgroundColor }}
                        />
                        <label htmlFor="rememberMe" className="ml-2 block text-sm"
                               style={{ color: themes[theme].textColor }}>
                            Lembrar meu email
                        </label>
                    </div>

                    <Button
                        type="submit"
                        disabled={loading}
                        className="w-full py-2 rounded-md hover:brightness-110 transition duration-200"
                        style={{
                            backgroundColor: themes[theme].accentColor,
                            color: themes[theme].textColor,
                        }}
                    >
                        {loading ? 'Carregando...' : 'Entrar'}
                    </Button>
                    {error && (
                        <p className="text-red-500 text-sm text-center">
                            {error}
                        </p>
                    )}
                </form>
                <p className="mt-6 text-center">
                    Não tem uma conta?{' '}
                    <Link to="/register" className="text-blue-600 hover:underline"
                          style={{ color: themes[theme].accentColor }}>
                        Cadastre-se
                    </Link>
                </p>
                <p className="mt-2 text-center">
                    <Link to="/forgot-password" className="text-gray-500 hover:underline"
                          style={{ color: themes[theme].textColor }}>
                        Esqueci minha senha?
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default Login;