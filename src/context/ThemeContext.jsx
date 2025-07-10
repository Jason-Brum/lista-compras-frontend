//Contexto para gerenciamento dos temas da aplicação
//O contexto ThemeContext é responsável por gerenciar o tema da aplicação. Ele fornece um hook useTheme para acessar o tema atual e um componente ThemeProvider para envolver a aplicação e fornecer o contexto.


import React, { createContext, useContext, useState, useEffect } from 'react';
import themes from '../themes'; // Importe seus temas

const ThemeContext = createContext();

function useTheme() {
  return useContext(ThemeContext);
}

function ThemeProvider({ children }) {
  // Definir 'minimalista' como tema padrão explícito
  const defaultThemeName = 'minimalista'; 

  const [theme, setTheme] = useState(() => {
    const storedTheme = localStorage.getItem('theme');
    // Verifica se o tema armazenado existe e é uma chave válida em 'themes'.
    // Se sim, usa o tema armazenado.
    if (storedTheme && themes[storedTheme]) {
      return storedTheme;
    }
    // Caso contrário, retorna 'minimalista' como tema padrão para a nova sessão.
    return defaultThemeName; 
  });

  const [showBackgroundImage, setShowBackgroundImage] = useState(JSON.parse(localStorage.getItem('showBackgroundImage')) ?? true);

  useEffect(() => {
    localStorage.setItem('theme', theme);
    localStorage.setItem('showBackgroundImage', JSON.stringify(showBackgroundImage));
    
    // Verifique se o tema selecionado existe antes de tentar acessá-lo.
    // Isso garante que mesmo se 'theme' for setado para algo inválido (por exemplo, manualmente no localStorage),
    // ele voltará para o tema padrão.
    const selectedTheme = themes[theme] || themes[defaultThemeName]; 

    // Aplicando as propriedades do tema no documento
    if (showBackgroundImage && selectedTheme.backgroundImage) {
      document.body.style.backgroundImage = selectedTheme.backgroundImage;
    } else {
      document.body.style.backgroundImage = 'none';
    }
    document.body.style.backgroundSize = 'cover';
    document.body.style.backgroundColor = selectedTheme.primaryColor;
    document.body.style.color = selectedTheme.textColor;

    // Aplicando as variáveis CSS do tema
    const root = document.documentElement;
    root.style.setProperty('--primary-color', selectedTheme.primaryColor);
    root.style.setProperty('--text-color', selectedTheme.textColor);
    root.style.setProperty('--accent-color', selectedTheme.accentColor);
  }, [theme, showBackgroundImage, defaultThemeName]);

  const changeTheme = (newTheme) => {
    // Adicionalmente, verifica se newTheme é uma chave válida de themes antes de setar.
    if (themes[newTheme]) {
      setTheme(newTheme);
    } else {
      console.warn(`Tentativa de mudar para tema inválido: ${newTheme}. Voltando para o padrão.`);
      setTheme(defaultThemeName); // Volta para o tema padrão se o novo tema for inválido
    }
  };

  const toggleBackgroundImage = () => {
    setShowBackgroundImage((prev) => !prev);
  };

  return (
    <ThemeContext.Provider value={{ theme, changeTheme, showBackgroundImage, toggleBackgroundImage, themes }}>
      {children}
    </ThemeContext.Provider>
  );
}

export { useTheme, ThemeProvider };