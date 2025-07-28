import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrashIcon } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import Button from "./Button";
import { useAuth } from '../context/AuthContext';
import themes from "../themes";
import { useModal } from '../context/ModalContext.jsx';

function ListItems({ idLista, triggerUpdateChange, userToken }) {
  const { theme } = useTheme();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { showAlert, showConfirm } = useModal();

  async function fetchItems(atualIdLista) {
    if (!atualIdLista) {
      setItems([]);
      setLoading(false);
      setError(null);
      return;
    }
    if (!userToken) {
        setItems([]);
        setError("Não autenticado. Faça login para ver os itens.");
        setLoading(false);
        return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/items/lista/${atualIdLista}`, {
        headers: {
          'Authorization': `Bearer ${userToken}`
        }
      });

      if (response.status === 401 || response.status === 403) {
          logout();
          navigate('/login');
          await showAlert('Sessão expirada ou acesso negado. Faça login novamente.');
          throw new Error('Sessão expirada ou acesso negado. Faça login novamente.');
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.erro || 'Erro ao buscar itens.');
      }

      const data = await response.json();
      setItems(data);
    } catch (err) {
      console.error("Erro ao buscar itens:", err.message);
      setError(err.message);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  async function onDeleteItemClick(itemId) {
    if (!userToken) {
        await showAlert("Você precisa estar logado para deletar itens.");
        return;
    }
    const isConfirmed = await showConfirm("Tem certeza que deseja deletar este item?");
    if (!isConfirmed) {
        return;
    }

    try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/items/${itemId}`, {
            method: "DELETE",
            headers: {
                'Authorization': `Bearer ${userToken}`
            }
        });

        if (response.status === 401 || response.status === 403) {
            logout();
            navigate('/login');
            await showAlert('Sessão expirada ou acesso negado ao deletar item.');
            throw new Error('Sessão expirada ou acesso negado ao deletar item.');
        }

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.erro || 'Erro ao deletar item.');
        }

        setItems((prevItems) => prevItems.filter((item) => item.idItem !== itemId));
        await showAlert("Item deletado com sucesso!");
    } catch (err) {
        console.error("Erro na requisição para deletar item:", err.message);
        await showAlert(`Erro ao deletar o item: ${err.message}`);
    }
  }

  async function onToggleItemClick(itemId, currentEstado) {
    if (!userToken) {
        await showAlert("Você precisa estar logado para alterar o estado dos itens.");
        return;
    }
    const novoEstado = currentEstado === 'COMPLETO' ? 'PENDENTE' : 'COMPLETO';

    try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/items/toggle-state/${itemId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${userToken}`
            },
            body: JSON.stringify({ estado: novoEstado })
        });

        if (response.status === 401 || response.status === 403) {
            logout();
            navigate('/login');
            await showAlert('Sessão expirada ou acesso negado ao alterar estado do item.');
            throw new Error('Sessão expirada ou acesso negado ao alterar estado do item.');
        }

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.erro || "Falha ao atualizar estado do item.");
        }

        setItems(prevItems => prevItems.map(item =>
            item.idItem === itemId ? { ...item, estado: novoEstado, isCompleted: !item.isCompleted } : item
        ));
        console.log(`Estado do item ${itemId} atualizado para ${novoEstado}`);

    } catch (error) {
        console.error("Erro ao alternar estado do item:", error.message);
        await showAlert(`Erro ao atualizar estado do item: ${error.message}`);
    }
  }

  useEffect(() => {
    fetchItems(idLista);
  }, [idLista, triggerUpdateChange, userToken]);

  const groupedItems = useMemo(() => {
    if (!items || items.length === 0) {
      return {};
    }
    const resultado = items.reduce((acc, item) => {
      const category = item.dsCategoria || "Outros";
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(item);
      return acc;
    }, {});
    return resultado;
  }, [items]);

  return (
    <div className="rounded-md shadow-md"
         style={{ backgroundColor: themes[theme].primaryColor }}
    >
      {loading && <p className="text-center" style={{ color: themes[theme].textColor }}>Carregando itens...</p>}
      {error && <p className="text-red-500 text-center">{error}</p>}
      {!idLista && !loading && !error && (
        <p className="text-gray-500 text-center" style={{ color: themes[theme].textColor }}>Selecione uma lista para ver os itens.</p>
      )}
      {idLista && !loading && !error && Object.keys(groupedItems).length === 0 && (
          <p className="text-gray-500 text-center" style={{ color: themes[theme].textColor }}>Nenhum item nesta lista ainda. Adicione alguns!</p>
      )}

      {Object.keys(groupedItems).map(categoryName => (
        <div key={categoryName} className="mb-4">
          <h2
            className="text-xl font-semibold mb-1 capitalize py-1 px-4"
            style={{ color: themes[theme].textColor }}
          >
            {categoryName}
          </h2>
          <ul
            className="space-y-2 rounded-md shadow-md p-3"
            style={{ backgroundColor: themes[theme].primaryColor, color: themes[theme].textColor }}
          >
            {groupedItems[categoryName].map((item, index) => (
              <li key={item.idItem}
                  className={`flex gap-2 items-stretch rounded-md ${index < groupedItems[categoryName].length - 1 ? 'mb-2' : ''}`}
              >
                <button
                  onClick={() => onToggleItemClick(item.idItem, item.estado)}
                  className={`text-left transition-opacity text-lg flex items-center flex-grow px-3 py-2 rounded-l-md rounded-r-md ${
                    item.isCompleted ? 'line-through opacity-70' : 'opacity-100'
                  }`}
                  style={{ color: themes[theme].textColor }}
                >
                  {item.nome} - {item.quantidade} und
                </button>
                <Button
                  onClick={() => onDeleteItemClick(item.idItem)}
                  className="flex-shrink-0 rounded-r-md"
                  style={{
                      backgroundColor: themes[theme].accentColor,
                      color: themes[theme].textColor,
                      padding: '8px',
                  }}
                  aria-label={`Deletar ${item.nome}`}
                >
                  <TrashIcon size={18} />
                </Button>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

export default ListItems;