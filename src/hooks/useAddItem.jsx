// src/hooks/useAddItem.js
import { useState, useEffect } from "react";
import { useAuth } from '../context/AuthContext';
import { useModal } from '../context/ModalContext.jsx'; // <-- CORREÇÃO 1: Importar o hook do modal

const API_URL_BASE = import.meta.env.VITE_API_BASE_URL;

export const useAddItem = (userToken) => {
    const { user, logout, navigate } = useAuth();
    const { showAlert } = useModal(); // <-- CORREÇÃO 2: Chamar o hook para pegar a função
    const currentToken = userToken || user?.token;

    const [item, setItem] = useState("");
    const [quantidade, setQuantidade] = useState("");
    const [categoria, setCategoria] = useState("");
    const [categorias, setCategorias] = useState([]);
    const [erros, setErros] = useState({});

    useEffect(() => {
        async function fetchCategorias() {
            if (!currentToken) {
                setCategorias([]);
                return;
            }
            try {
                const res = await fetch(`${API_URL_BASE}/categorias`, {
                    headers: {
                        'Authorization': `Bearer ${currentToken}`
                    }
                });

                if (res.status === 401 || res.status === 403) {
                    console.error("Erro de autenticação ao buscar categorias. Possivelmente token expirado.");
                    setCategorias([]);
                    return; 
                }

                if (!res.ok) {
                    const errorData = await res.json();
                    throw new Error(errorData.erro || "Erro ao buscar categorias do backend.");
                }

                const data = await res.json();
                setCategorias(data);
            } catch (err) {
                console.error("Erro ao buscar categorias:", err.message);
                setCategorias([]);
            }
        }
        fetchCategorias();
    }, [currentToken, logout, navigate]); 

    const adicionarItem = async (idLista) => {
        setErros({}); 
        
        const novosErros = {};
        if (!idLista) { novosErros.idLista = "Nenhuma lista foi selecionada."; }
        if (!item) { novosErros.item = "Campo item é obrigatório."; }
        if (!quantidade) { novosErros.quantidade = "Campo quantidade é obrigatório."; }
        if (!categoria) { novosErros.categoria = "A categoria deve ser selecionada."; }
        
        if (Object.keys(novosErros).length > 0) {
            setErros(novosErros);
            return null;
        }

        const novoItem = {
            nome: item,
            quantidade: parseInt(quantidade),
            idCategoria: parseInt(categoria),
            idLista: parseInt(idLista),
        };

        try {
            const response = await fetch(`${API_URL_BASE}/items`, { 
                method: "POST",
                headers: { "Content-Type": "application/json", 'Authorization': `Bearer ${currentToken}` },
                body: JSON.stringify(novoItem),
            });

            if (response.status === 401 || response.status === 403) {
                logout(); 
                navigate('/login'); 
                throw new Error('Não autorizado ou token expirado ao adicionar item.');
            }

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.erro || "Erro ao adicionar item do backend.");
            }

            const data = await response.json();

            setItem("");
            setQuantidade("");
            setCategoria("");
            setErros({}); 

            return data;
        } catch (err) {
            console.error("Erro ao adicionar item:", err.message);
            // <-- CORREÇÃO 3: Substituir o alert() padrão pelo showAlert customizado
            await showAlert(err.message); 
            return null;
        }
    };

    return {
        item,
        quantidade,
        categoria,
        categorias,
        erros,
        setItem,
        setQuantidade,
        setCategoria,
        adicionarItem,
        setErros,
    };
};