import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from 'react';
import { createMuiTheme } from '@material-ui/core/styles';
import useMediaQuery from '@material-ui/core/useMediaQuery';
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

const storedThemeType = window.localStorage.getItem('themeType');

export const ThemeProvider = ({ children }) => {
  const prefersDarkMode = useMediaQuery('@media (prefers-color-scheme: dark)');
  const preferredThemeType = prefersDarkMode ? 'dark' : 'light';
  const [themeType, setThemeType] = useState(
    storedThemeType || preferredThemeType
  );
  const toggleTheme = useCallback(() => {
    setThemeType(themeType => (themeType === 'light' ? 'dark' : 'light'));
  }, []);

  useEffect(() => {
    window.localStorage.setItem('themeType', themeType);
    const themeMetaTag = document.querySelector('meta[name="theme-color"]');
    if (themeMetaTag) {
      themeMetaTag.setAttribute(
        'content',
        themeType === 'dark' ? grey['900'] : blue['700']
      );
    }
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
