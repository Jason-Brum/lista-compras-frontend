import { useState, useEffect } from "react";
import { useAuth } from '../context/AuthContext'; // Importar useAuth para acessar o token diretamente ou passá-lo como prop

// Você pode passar o userToken como argumento para o hook, ou importá-lo via useAuth
export const useAddItem = (userToken) => { // Aceita userToken como prop
    const { user } = useAuth(); // Alternativa: Obter o token diretamente do contexto
    const currentToken = userToken || user?.token; // Prioriza prop, senão pega do contexto

    const [item, setItem] = useState("");
    const [quantidade, setQuantidade] = useState("");
    const [categoria, setCategoria] = useState("");
    const [categorias, setCategorias] = useState([]);
    const [erros, setErros] = useState({});

    useEffect(() => {
        // Incluir o token na requisição de categorias
        async function fetchCategorias() {
            if (!currentToken) { // Não tenta buscar categorias se não houver token
                setCategorias([]); // Limpa categorias se não houver token
                return;
            }
            try {
                const res = await fetch("http://localhost:3001/categorias", {
                    headers: {
                        'Authorization': `Bearer ${currentToken}` // Envia o token
                    }
                });

                if (res.status === 401 || res.status === 403) {
                    // Se a busca de categorias falhar por auth, o ideal é que o AuthProvider/MainAppContent
                    // já lide com o logout/redirecionamento se for uma rota globalmente protegida.
                    // Mas para garantir, podemos tratar aqui também.
                    console.error("Erro de autenticação ao buscar categorias. Possivelmente token expirado.");
                    setCategorias([]); // Limpa as categorias
                    // NAVEGUE ou deslogue aqui se essa rota é crítica para não-autenticados
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
                // alert(`Erro ao carregar categorias: ${err.message}`);
                setCategorias([]); // Garante que a lista esteja vazia em caso de erro
            }
        }
        fetchCategorias();
    }, [currentToken]); // Refaz a busca quando o token muda

    const adicionarItem = async (idLista) => {
        // Reinicia os erros no início da submissão
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
            const res = await fetch("http://localhost:3001/items", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    'Authorization': `Bearer ${currentToken}` // Envia o token aqui
                },
                body: JSON.stringify(novoItem),
            });

            if (res.status === 401 || res.status === 403) {
                // Se a adição do item falhar por auth, desloga
                logout(); // Função de logout do AuthContext
                // navigate('/login'); // Navegue para login, se precisar
                throw new Error('Não autorizado ou token expirado ao adicionar item.');
            }

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.erro || "Erro ao adicionar item do backend.");
            }

            const data = await res.json();

            // Limpa os campos após adicionar
            setItem("");
            setQuantidade("");
            setCategoria("");
            setErros({}); // Limpa os erros após adicionar com sucesso

            return data;
        } catch (err) {
            console.error("Erro ao adicionar item:", err.message);
            alert(`Erro ao adicionar item: ${err.message}`);
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