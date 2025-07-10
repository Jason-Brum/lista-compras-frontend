// Input.jsx
import { useTheme } from "../context/ThemeContext";

function Input(props) {
  const { theme } = useTheme();

  return (
    <input
      className={`px-4 py-2 rounded-md font-medium w-full`}
      style={{
        backgroundColor: theme.selectBackgroundColor,
        color: theme.textColor,
        border: `2px solid ${theme.accentColor}`,
      }}
      {...props}
    />
  );
}

export default Input;
