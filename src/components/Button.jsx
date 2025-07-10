// Button.jsx

import { useTheme } from "../context/ThemeContext";

function Button({ children, ...props }) {
  const { theme } = useTheme();

  return (
    <button
      {...props}
      className="px-4 py-2 rounded-md font-medium"
      style={{
        backgroundColor: theme.accentColor,
        color: theme.textColor,
      }}
    >
      {children}
    </button>
  );
}

export default Button;


