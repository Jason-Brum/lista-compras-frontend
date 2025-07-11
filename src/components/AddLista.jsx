import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Plus, Edit, Trash2, Save, X } from 'lucide-react'; 
import { useTheme } from '../context/ThemeContext'; // <-- NOVO: Importar useTheme aqui
import themes from '../themes'; // <-- NOVO: Importar themes aqui
import { useModal } from '../context/ModalContext';

const AddLista = ({ idUsuario, userToken }) => {
  const [listas, setListas] = useState([]);
  const [novaLista, setNovaLista] = useState('');
  const [editandoId, setEditandoId] = useState(null);
  const [nomeEditado, setNomeEditado] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { logout, navigate } = useAuth();
  const { theme } = useTheme(); // <-- NOVO: Obter o tema do contexto
  const { showAlert } = useModal();

  async function fetchListas() {
    if (!idUsuario || !userToken) {
      setListas([]);
      setLoading(false);
      setError("Usuário não autenticado. Faça login para gerenciar listas.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`https://lista-compras-backend-api-render.onrender.com/listas/${idUsuario}`, {
        headers: {
          'Authorization': `Bearer ${userToken}`
        }
      });

      if (response.status === 401 || response.status === 403) {
          logout();
          navigate('/login');
          throw new Error('Sessão expirada ou acesso negado. Faça login novamente.');
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.erro || 'Falha ao buscar listas.');
      }

      const data = await response.json();
      setListas(data);
    } catch (err) {
      console.error('Erro ao buscar listas:', err.message);
      setError(err.message);
      setListas([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchListas();
  }, [idUsuario, userToken, logout, navigate, theme]); // Adicionei 'theme' como dependência para recarregar com mudança de tema

  const adicionarLista = async () => {
    if (novaLista.trim() === '') {
      alert("Verifique se o campo de nova lista não está vazio!");
      return;
    }
    if (!idUsuario || !userToken) {
        alert("Você precisa estar logado para adicionar listas.");
        return;
    }

    const nova = {
      nomeDaLista: novaLista,
      dataDeCriacao: new Date().toISOString().split('T')[0],
      tema: null
    };

    try {
      const response = await fetch('https://lista-compras-backend-api-render.onrender.com/listas', {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${userToken}`
        },
        body: JSON.stringify(nova),
      });

      if (response.status === 401 || response.status === 403) {
          logout();
          navigate('/login');
          throw new Error('Sessão expirada ou acesso negado ao adicionar lista.');
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.erro || 'Falha ao adicionar lista.');
      }

      const data = await response.json();
      setListas([...listas, data]);
      setNovaLista('');
      await showAlert(data.mensagem);
      setError(null);
    } catch (err) {
      console.error('Erro ao adicionar lista:', err.message);
      await showAlert(`Erro ao adicionar lista: ${err.message}`);
      setError(err.message);
    }
  };

  const removerLista = async (id) => {
    if (!userToken) {
        alert("Você precisa estar logado para remover listas.");
        return;
    }
    if (!window.confirm("Tem certeza que deseja remover esta lista? Isso também removerá todos os itens dela!")) {
        return;
    }
    try {
      const response = await fetch(`https://lista-compras-backend-api-render.onrender.com/listas/${id}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${userToken}`
        }
      });

      if (response.status === 401 || response.status === 403) {
          logout();
          navigate('/login');
          throw new Error('Sessão expirada ou acesso negado ao remover lista.');
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.erro || 'Falha ao excluir lista.');
      }

      setListas(listas.filter((lista) => lista.idLista !== id));
      alert("Lista removida com sucesso!");
      setError(null);
    } catch (err) {
      console.error('Erro ao excluir lista:', err.message);
      alert(`Erro ao excluir lista: ${err.message}`);
      setError(err.message);
    }
  };

  const iniciarEdicao = (id, nomeAtual) => {
    setEditandoId(id);
    setNomeEditado(nomeAtual);
  };

  const salvarEdicao = async (id) => {
    if (nomeEditado.trim() === '') {
        alert("O nome da lista não pode ser vazio.");
        return;
    }
    if (!userToken) {
        alert("Você precisa estar logado para editar listas.");
        return;
    }
    try {
      const response = await fetch(`https://lista-compras-backend-api-render.onrender.com/listas/${id}`, {
        method: 'PUT',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${userToken}`
        },
        body: JSON.stringify({ nomeDaLista: nomeEditado }),
      });

      if (response.status === 401 || response.status === 403) {
          logout();
          navigate('/login');
          throw new Error('Sessão expirada ou acesso negado ao editar lista.');
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.erro || 'Falha ao editar lista.');
      }

      setListas(
        listas.map((lista) =>
          lista.idLista === id ? { ...lista, nomeDaLista: nomeEditado } : lista
        )
      );
      setEditandoId(null);
      setNomeEditado('');
      alert("Lista editada com sucesso!");
      setError(null);
    } catch (err) {
      console.error('Erro ao editar lista:', err.message);
      alert(`Erro ao editar lista: ${err.message}`);
      setError(err.message);
    }
  };

  return (
    <div className="mt-6 space-y-4">
      <h2 className="text-xl font-semibold mb-2">Suas Listas</h2>

      {loading && <p className="text-center" style={{ color: themes[theme].textColor }}>Carregando listas...</p>}
      {error && <p className="text-red-500 text-center">{error}</p>}
      {!idUsuario && !loading && !error && <p className="text-gray-500 text-center" style={{ color: themes[theme].textColor }}>Faça login para gerenciar suas listas.</p>}


      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Nome da nova lista"
          value={novaLista}
          onChange={(e) => setNovaLista(e.target.value)}
          // Aplicando cores do tema ao input
          className="flex-1 p-2 border rounded-md" 
          style={{
              backgroundColor: themes[theme].selectBackgroundColor,
              color: themes[theme].selectTextColor,
              borderColor: themes[theme].accentColor,
          }}
        />
        <button
          onClick={adicionarLista}
          className="px-4 py-2 rounded-md hover:brightness-110" // Removido bg-blue-600/700
          style={{ // Aplicando cores do tema ao botão
              backgroundColor: themes[theme].accentColor,
              color: themes[theme].textColor,
          }}
        >
          <Plus size={20} />
        </button>
      </div>

      <ul className="space-y-2">
        {listas.length === 0 && !loading && !error && idUsuario && (
            <p className="text-gray-500 text-center" style={{ color: themes[theme].textColor }}>Nenhuma lista encontrada. Crie uma!</p>
        )}
        {listas.map((lista) => (
          <li
            key={lista.idLista}
            className="flex items-center justify-between p-2 rounded-md" // Removido bg-gray-100
            style={{ backgroundColor: themes[theme].selectBackgroundColor }} // Aplicando cor do tema ao item da lista
          >
            {editandoId === lista.idLista ? (
              <>
                <input
                  value={nomeEditado}
                  onChange={(e) => setNomeEditado(e.target.value)}
                  // Aplicando cores do tema ao input de edição
                  className="flex-1 p-1 border rounded-md mr-2" 
                  style={{
                      backgroundColor: themes[theme].primaryColor, // Fundo pode ser primário ou selectBackground
                      color: themes[theme].textColor,
                      borderColor: themes[theme].accentColor,
                  }}
                />
                <button
                  onClick={() => salvarEdicao(lista.idLista)}
                  className="px-3 py-1 rounded-md hover:brightness-110 mr-2" // Removido cores Tailwind fixas
                  style={{ 
                      backgroundColor: themes[theme].accentColor, // Aplicando cores do tema
                      color: themes[theme].textColor,
                  }}
                >
                  <Save size={18} />
                </button>
                <button
                  onClick={() => setEditandoId(null)}
                  className="px-3 py-1 rounded-md hover:brightness-110" // Removido cores Tailwind fixas
                  style={{ 
                      backgroundColor: themes[theme].accentColor, // Aplicando cores do tema
                      color: themes[theme].textColor,
                  }}
                >
                  <X size={18} />
                </button>
              </>
            ) : (
              <>
                <span style={{ color: themes[theme].selectTextColor }}>{lista.nomeDaLista}</span> {/* Cor do texto do item */}
                <div className="flex gap-2">
                  <button
                    onClick={() => iniciarEdicao(lista.idLista, lista.nomeDaLista)}
                    className="px-3 py-1 rounded-md hover:brightness-110" // Removido cores Tailwind fixas
                    style={{ 
                        backgroundColor: themes[theme].accentColor, // Aplicando cores do tema
                        color: themes[theme].textColor,
                    }}
                  >
                    <Edit size={18} />
                  </button>
                  <button
                    onClick={() => removerLista(lista.idLista)}
                    className="px-3 py-1 rounded-md hover:brightness-110" // Removido cores Tailwind fixas
                    style={{ 
                        backgroundColor: themes[theme].accentColor, // Aplicando cores do tema
                        color: themes[theme].textColor,
                    }}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AddLista;