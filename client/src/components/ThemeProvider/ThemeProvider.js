import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from 'react';
import { createMuiTheme } from '@material-ui/core/styles';
import { ThemeProvider as MuiThemeProvider } from '@material-ui/styles';
import { blue, grey, pink } from '@material-ui/core/colors';

const themes = {
  light: createMuiTheme({
    palette: {
      primary: {
        main: blue[700],
      },
      secondary: {
        main: grey[900],
      },
    },
  }),
  dark: createMuiTheme({
    palette: {
      type: 'dark',
      primary: {
        main: blue[200],
      },
      secondary: {
        main: pink['A400'],
      },
    },
  }),
};

const ToggleThemeContext = createContext();

const initialThemeType = window.localStorage.getItem('themeType') || 'light';

export const ThemeProvider = ({ children }) => {
  const [themeType, setThemeType] = useState(initialThemeType);
  const toggleTheme = useCallback(() => {
    setThemeType(themeType => (themeType === 'light' ? 'dark' : 'light'));
  }, []);

  useEffect(() => {
    window.localStorage.setItem('themeType', themeType);
  }, [themeType]);

  return (
    <MuiThemeProvider theme={themes[themeType]}>
      <ToggleThemeContext.Provider value={toggleTheme}>
        {children}
      </ToggleThemeContext.Provider>
    </MuiThemeProvider>
  );
};

export const useToggleTheme = () => {
  return useContext(ToggleThemeContext);
};
