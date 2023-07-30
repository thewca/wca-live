import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useMemo,
} from 'react';
import {
  createTheme,
  ThemeProvider as MuiThemeProvider,
} from '@mui/material/styles';
import { useMediaQuery } from '@mui/material';
import { blue, grey, pink } from '@mui/material/colors';

const themes = {
  light: createTheme({
    palette: {
      primary: {
        main: blue[700],
      },
      secondary: {
        main: grey[900],
      },
    },
  }),
  dark: createTheme({
    palette: {
      mode: 'dark',
      primary: {
        main: blue[200],
      },
      secondary: {
        main: pink['A400'],
      },
    },
  }),
};

const themeColor = {
  light: blue['700'],
  dark: grey['900'],
};

const ToggleThemeContext = createContext();

function getStoredThemeType() {
  return localStorage.getItem('themeType');
}

function setStoredThemeType(themeType) {
  localStorage.setItem('themeType', themeType);
}

export function ThemeProvider({ children }) {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const preferredThemeType = prefersDarkMode ? 'dark' : 'light';
  const storedThemeType = useMemo(getStoredThemeType, []);
  const [themeType, setThemeType] = useState(
    storedThemeType || preferredThemeType
  );

  const toggleTheme = useCallback(() => {
    setThemeType((themeType) => (themeType === 'light' ? 'dark' : 'light'));
  }, []);

  useEffect(() => {
    setStoredThemeType(themeType);

    const themeMetaTag = document.querySelector('meta[name="theme-color"]');
    if (themeMetaTag) {
      themeMetaTag.setAttribute('content', themeColor[themeType]);
    }
  }, [themeType]);

  return (
    <MuiThemeProvider theme={themes[themeType]}>
      <ToggleThemeContext.Provider value={toggleTheme}>
        {children}
      </ToggleThemeContext.Provider>
    </MuiThemeProvider>
  );
}

export function useToggleTheme() {
  return useContext(ToggleThemeContext);
}
