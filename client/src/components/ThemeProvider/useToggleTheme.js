import { createContext, useContext } from "react";

export const ToggleThemeContext = createContext();

export default function useToggleTheme() {
  return useContext(ToggleThemeContext);
}
