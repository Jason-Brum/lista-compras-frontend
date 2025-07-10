// src/pages/SettingsPage.jsx - Nova página para escolha do tema e/ou para desabilitar a imagem de fundo.

import React from 'react';
import { useTheme } from '../context/ThemeContext';
import themes from '../themes';
import { useNavigate } from 'react-router-dom';
import AddLista from '../components/AddLista';
import { useAuth } from '../context/AuthContext';

function SettingsPage() {
  const { theme, changeTheme, showBackgroundImage, toggleBackgroundImage } = useTheme();
  const navigate = useNavigate();
  const { user } = useAuth();

  const idUsuarioAutenticado = user ? user.user.idUsuario : null;
  const userToken = user ? user.token : null;

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-6"
      style={{
        backgroundImage: showBackgroundImage ? themes[theme].backgroundImage : "none",
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
        backgroundColor: themes[theme].primaryColor,
        color: themes[theme].textColor
      }}
    >
      <h1 className="text-3xl font-bold mb-6">Configurações</h1>
      <div
        className="space-y-4 w-full max-w-md p-6 rounded-lg shadow-xl"
        style={{ backgroundColor: themes[theme].primaryColor }}
      >
        {/* Seção Escolha o Tema */}
        <div>
          <label className="block font-semibold mb-2">Escolha o Tema:</label>
          <div className="relative">
            <select
              value={theme}
              onChange={(e) => changeTheme(e.target.value)}
              className="w-full p-2 rounded-md border appearance-none pr-8"
              style={{
                  backgroundColor: themes[theme].selectBackgroundColor,
                  color: themes[theme].selectTextColor,
                  borderColor: themes[theme].accentColor,
              }}
            >
              {Object.keys(themes).map((themeKey) => (
                <option key={themeKey} value={themeKey}>
                  {themes[themeKey].name}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2"
                 style={{ color: themes[theme].selectTextColor }}
            >
              <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 6.091 6.919 4.677 8.333z"/></svg>
            </div>
          </div>
        </div>

        {/* Checkbox Desabilitar imagem de fundo */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={!showBackgroundImage}
            onChange={toggleBackgroundImage}
            className="h-4 w-4"
            style={{ borderColor: themes[theme].accentColor, backgroundColor: themes[theme].selectBackgroundColor }}
          />
          <label style={{ color: themes[theme].textColor }}>Desabilitar imagem de fundo</label>
        </div>

        {/* DIVISOR COM SOMBRA #1 */}
        {/* Adiciona margem abaixo e sombra, com a cor de fundo do tema */}
        <div className="mb-6 pb-2 border-b" 
             style={{ borderColor: themes[theme].accentColor, boxShadow: `0 2px 4px ${themes[theme].selectBackgroundColor}40` }}> 
             {/* Sombra sutil, ajuste o '40' para opacidade */}
        </div>
        
        {/* Componente AddLista (Contém o campo "Nome da nova lista" e botões de gerenciamento de listas) */}
        <AddLista 
            idUsuario={idUsuarioAutenticado} 
            userToken={userToken}
        />

        {/* DIVISOR COM SOMBRA #2 (APÓS A SEÇÃO AddLista) */}
        {/* Você pode ajustar a classe mb-6 aqui ou no AddLista para controlar o espaço após ele */}
        <div className="mb-6 mt-4 pb-2 border-b" 
             style={{ borderColor: themes[theme].accentColor, boxShadow: `0 2px 4px ${themes[theme].selectBackgroundColor}40` }}>
        </div>

        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 rounded-md font-medium border-2"
          style={{
            backgroundColor: themes[theme].accentColor,
            color: themes[theme].textColor,
            borderColor: themes[theme].textColor,
          }}
        >
          Voltar
        </button>
      </div>
    </div>
  );
}

export default SettingsPage;