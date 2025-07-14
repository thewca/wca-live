import { BrowserRouter as Router } from "react-router-dom";
import CssBaseline from "@mui/material/CssBaseline";
import { ConfirmProvider } from "material-ui-confirm";
import { ApolloProvider } from "@apollo/client";
import { SnackbarProvider } from "notistack";
import { StyledEngineProvider } from "@mui/material/styles";
import { Helmet, HelmetProvider } from "react-helmet-async";
import { client } from "./apollo";
import ThemeProvider from "../ThemeProvider/ThemeProvider";
import Navigation from "../Navigation/Navigation";

function App() {
  return (
    <HelmetProvider>
      <Helmet>
        <title>WCA Live</title>
      </Helmet>
      <Router>
        <ApolloProvider client={client}>
          <StyledEngineProvider injectFirst>
            <ThemeProvider>
              <SnackbarProvider
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
              >
                <ConfirmProvider>
                  <CssBaseline />
                  <Navigation />
                </ConfirmProvider>
              </SnackbarProvider>
            </ThemeProvider>
          </StyledEngineProvider>
        </ApolloProvider>
      </Router>
    </HelmetProvider>
  );
}

export default App;
