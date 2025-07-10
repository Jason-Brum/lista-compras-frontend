import { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, useNavigate, Navigate, Link } from "react-router-dom";
import { ChevronDown, ChevronUp, Settings } from "lucide-react";

import { AuthProvider, useAuth } from "./context/AuthContext";
import AddItem from "./components/AddItem";
import ListItems from "./components/listItems";
import "./index.css";
import { useTheme } from "./context/ThemeContext";
import themes from "./themes";
import { useModal } from './context/ModalContext.jsx';

import Login from "./components/Login";
import Register from "./components/Register";
import AddLista from "./components/AddLista";
import SettingsPage from "./pages/SettingsPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage.jsx";
import ResetPasswordPage from "./pages/ResetPasswordPage.jsx";


const PrivateRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();
    if (loading) { return (<div className="min-h-screen flex items-center justify-center bg-gray-100"><p>Carregando autenticação...</p></div>); }
    return isAuthenticated ? children : <Navigate to="/login" replace />;
};


function MainAppContent() {
    const { user, logout, isAuthenticated } = useAuth();
    const idUsuario = user ? user.user.idUsuario : null;

    const [listId, setListId] = useState("");
    const [listas, setListas] = useState([]);
    const [triggerUpdate, setTriggerUpdate] = useState(0);
    const { theme, showBackgroundImage } = useTheme();
    const navigate = useNavigate();
    const { showAlert, showConfirm } = useModal();


    function fetchListas() {
        if (!idUsuario) { setListas([]); return; }
        fetch(`http://localhost:3001/listas/${idUsuario}`, { headers: { 'Authorization': user && user.token ? `Bearer ${user.token}` : '' } })
            .then((res) => {
                if (res.status === 401 || res.status === 403) { logout(); navigate('/login'); showAlert('Sessão expirada ou acesso negado. Faça login novamente.'); throw new Error('Sessão expirada ou acesso negado. Faça login novamente.'); }
                return res.json();
            })
            .then((data) => setListas(data))
            .catch((err) => { console.error("Erro ao buscar listas:", err); showAlert(`Erro ao buscar listas: ${err.message}`); });
    }

    function handlePrint() { window.print(); }

    async function handleClearList() {
        if (!listId) { await showAlert('Selecione uma lista para limpar.'); return; }
        const isConfirmed = await showConfirm("Tem certeza que deseja apagar todos os itens da lista?");
        if (!isConfirmed) { return; }

        try {
            const res = await fetch(`http://localhost:3001/items/lista/${listId}`, { method: "DELETE", headers: { 'Authorization': user && user.token ? `Bearer ${user.token}` : '' } });
            if (res.status === 401 || res.status === 403) { logout(); navigate('/login'); await showAlert('Sessão expirada ou token expirado.'); throw new Error('Sessão expirada ou token expirado.'); }
            if (res.ok) {
                try { const data = await res.json(); if (data.erro) throw new Error(data.erro); await showAlert("Itens da lista limpos com sucesso!"); }
                catch (e) { await res.text(); await showAlert("Itens da lista limpos com sucesso!"); }
            } else { const errorData = await res.json(); await showAlert(errorData.erro || 'Erro desconhecido ao limpar itens.'); throw new Error(errorData.erro || 'Erro desconhecido ao limpar itens.'); }
        } catch (err) { console.error("Erro ao limpar items no backend:", err); await showAlert(`Erro ao limpar lista: ${err.message}`); }
        finally { setTriggerUpdate((prev) => prev + 1); }
    }

    function handleItemAdded(novoItem) {
        setListId(novoItem.idLista);
        setTriggerUpdate((prev) => prev + 1);
    }

    useEffect(() => {
        fetchListas();
    }, [idUsuario, triggerUpdate, isAuthenticated, logout, navigate, user?.token, showAlert]);

    return (
        <div
            className={`min-h-screen w-full flex justify-center p-4 md:p-6`}
            style={{
                backgroundImage: showBackgroundImage ? themes[theme].backgroundImage : "none",
                backgroundSize: "cover",
                backgroundRepeat: "no-repeat",
                backgroundPosition: "center",
                backgroundColor: themes[theme].primaryColor,
                color: themes[theme].textColor,
            }}
        >
            <div className="w-full max-w-lg space-y-4">
                <div className="flex justify-between items-center mb-4">
                    <div className="relative flex-1">
                        <select
                            value={listId}
                            onChange={(e) => setListId(e.target.value)}
                            className="w-full border border-gray-300 px-3 py-1.5 rounded-md shadow-md appearance-none pr-8 text-base"
                            style={{
                                backgroundColor: themes[theme].selectBackgroundColor,
                                color: themes[theme].selectTextColor,
                                borderColor: themes[theme].accentColor,
                            }}
                        >
                            <option value="">Selecione uma lista</option>
                            {listas.map((lista) => (
                                <option key={lista.idLista} value={lista.idLista}>
                                    {lista.nomeDaLista}
                                </option>
                            ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700"
                             style={{ color: themes[theme].textColor }}
                        >
                            <ChevronDown size={20} />
                        </div>
                    </div>

                    <button
                        onClick={() => navigate("/settings")}
                        className="ml-2 p-2 rounded-md"
                        style={{
                            backgroundColor: themes[theme].accentColor,
                            color: themes[theme].textColor,
                        }}
                    >
                        <Settings size={18} />
                    </button>
                </div>

                <AddItem onItemAdded={handleItemAdded}
                    idLista={listId}
                    userToken={user?.token}
                />

                {/* AQUI ESTÁ A CORREÇÃO: Removemos a div extra */}
                <ListItems
                    idLista={listId}
                    triggerUpdateChange={triggerUpdate}
                    userToken={user?.token}
                />

                <div className="flex flex-col md:flex-row gap-2 mt-4">
                    <button
                        onClick={handleClearList}
                        className="px-4 py-2 rounded-md w-full md:w-1/2 font-medium"
                        style={{
                            backgroundColor: themes[theme].accentColor,
                            color: themes[theme].textColor,
                        }}
                    >
                        Limpar Lista
                    </button>
                    {isAuthenticated && (
                        <button
                            onClick={logout}
                            className="px-4 py-2 rounded-md w-full md:w-1/2 font-medium"
                            style={{
                                backgroundColor: themes[theme].accentColor,
                                color: themes[theme].textColor,
                            }}
                        >
                            Sair
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}


function App() {
    return (
        <Router>
            <AuthProvider>
                <Routes>
                    {/* Rotas públicas */}
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                    <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
                    
                    {/* Rota privada para o conteúdo principal do aplicativo */}

                    <Route
                        path="/"
                        element={
                            <PrivateRoute>
                                <MainAppContent />
                            </PrivateRoute>
                        }
                    />
                     <Route
                        path="/add-lista"
                        element={
                            <PrivateRoute>
                                <AddLista />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/settings"
                        element={
                            <PrivateRoute>
                                <SettingsPage />
                            </PrivateRoute>
                        }
                    />
                    <Route path="*" element={
                        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 text-gray-800">
                            <h2>404 - Página Não Encontrada</h2>
                            <p>Verifique o URL ou volte para a <Link to="/" className="text-blue-500 hover:underline">Página Inicial</Link>.</p>
                        </div>
                    } />

                </Routes>
            </AuthProvider>
        </Router>
    );
}

export default App;