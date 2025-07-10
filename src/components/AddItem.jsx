import React, { useState, useEffect } from "react";
import { useAddItem } from "../hooks/useAddItem";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import themes from '../themes';

const AddItem = ({ onItemAdded, idLista, userToken }) => {
  const {
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
  } = useAddItem(userToken); 

  const [isCollapsed, setIsCollapsed] = useState(true);
  const { theme } = useTheme();

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Adicionando item:", { item, quantidade, categoria, idLista });
    if (!idLista) {
        setErros(prev => ({ ...prev, idLista: "Selecione uma lista antes de adicionar item." }));
        return;
    }

    const novoItem = await adicionarItem(idLista);
    if (novoItem && onItemAdded) {
      onItemAdded(novoItem);
      setIsCollapsed(true);
    }
  };

  useEffect(() => {
    setErros(prev => ({...prev, idLista:''}));
  }, [idLista]);

  const toggleCollapse = () => {
    setIsCollapsed(prev => !prev);
  };

  return (
    // AQUI ESTÁ A CORREÇÃO: Combinando as classes em uma única expressão de template string
    <div className={`rounded-md shadow-md mb-4 ${isCollapsed ? 'rounded-b-md' : 'rounded-b-none'}`} 
         style={{ backgroundColor: themes[theme].primaryColor }}
    >
      {/* Cabeçalho clicável para recolher/expandir */}
      <div 
        // Esta linha já está correta, não precisa de mudança aqui
        className={`flex justify-between items-center p-4 cursor-pointer rounded-t-md ${isCollapsed ? 'rounded-b-md' : 'rounded-b-none'}`} 
        onClick={toggleCollapse}
        style={{ 
            backgroundColor: themes[theme].accentColor,
            color: themes[theme].textColor,
        }}
      >
        <h2 className="text-xl font-semibold">Adicionar item</h2>
        {isCollapsed ? <ChevronDown size={24} /> : <ChevronUp size={24} />}
      </div>

      {/* Conteúdo do formulário (visível ou oculto) */}
      <div className={`overflow-hidden transition-all duration-300 ${isCollapsed ? 'max-h-0' : 'max-h-screen'}`}>
        <form onSubmit={handleSubmit} className="flex flex-col p-4 space-y-3">
          {erros.idLista && <p className="text-red-500 text-sm mt-1">{erros.idLista}</p>} 

          <div className="mb-2">
            <input
              type="text"
              value={item}
              onChange={(e) => setItem(e.target.value)}
              placeholder="Nome do item"
              className="border p-2 rounded w-full"
              style={{
                  backgroundColor: themes[theme].selectBackgroundColor,
                  color: themes[theme].selectTextColor,
                  borderColor: themes[theme].accentColor,
              }}
            />
            {erros.item && <p className="text-red-500 text-sm mt-1">{erros.item}</p>} 
          </div>
            
          <div className="mb-2">
            <input 
              type="number" min="1"
              value={quantidade}
              onChange={(e) => setQuantidade(e.target.value)}
              placeholder="Quantidade"
              className="border p-2 rounded w-full"
              style={{
                  backgroundColor: themes[theme].selectBackgroundColor,
                  color: themes[theme].selectTextColor,
                  borderColor: themes[theme].accentColor,
              }}
            />
            {erros.quantidade && <p className="text-red-500 text-sm mt-1">{erros.quantidade}</p>}
          </div>

          <div className="mb-2 relative">
            <select
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
              className="border p-2 rounded w-full appearance-none pr-8"
              style={{
                  backgroundColor: themes[theme].selectBackgroundColor,
                  color: themes[theme].selectTextColor,
                  borderColor: themes[theme].accentColor,
              }}
            >
              <option value="">Selecione uma categoria</option>
              {categorias.map((cat) => (
                <option key={cat.idCategoria} value={cat.idCategoria}>
                  {cat.nome}
                </option>
              ))}
            </select>
            {/* Ícone de seta customizado para o select de categoria */}
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
              <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 6.091 6.919 4.677 8.333z"/></svg>
            </div>
            {erros.categoria && <p className="text-red-500 text-sm mt-1">{erros.categoria}</p>}
          </div>

          <button type="submit" className="p-2 rounded hover:brightness-110 transition duration-200"
            style={{ 
                backgroundColor: themes[theme].accentColor,
                color: themes[theme].textColor,
            }}>
            Adicionar
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddItem;