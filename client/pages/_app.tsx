import React from "react";
import { AppProps } from "next/app";
import { createGlobalStyle, ThemeProvider } from "styled-components";
import NProgress from "nprogress";
import Router from "next/router";
import "bootstrap/dist/css/bootstrap.min.css";
import Nav from "../components/Nav";

Router.events.on("routeChangeStart", () => {
  NProgress.start();
});
Router.events.on("routeChangeComplete", () => NProgress.done());
Router.events.on("routeChangeError", () => NProgress.done());

export interface ITheme {
  [index: string]: string;
}

export interface IThemeWrapper {
  theme: ITheme;
}

export const theme: ITheme = {
  green: "#51ac2f",
  darkGreen: "#28710E",
  darkOffWhite: "#F0F0F0",
  offWhite: "#FFFFFF",
  darkGrey: "#686868",
  lightGrey: "#e0e1e2",
  smallMobileBreakpoin: "320px",
  largeMobileBreakpoint: "376px",
  tabletBreakpoint: "767px",
  smallDesktopBreakpoint: "1024px",
};

const GlobalStyle = createGlobalStyle<IThemeWrapper>`
  body {
    margin: 0 auto;
    padding: 0;
    color: ${(props) => props.theme.niceBlack}; 
  }
  html {
    box-sizing: border-box;
    padding: 0;
  }
  *, *:before, *:after {
    box-sizing: inherit;
  }
`;

const MyApp = ({ Component, pageProps }: AppProps) => {
  return (
    <>
      <Nav />
      <ThemeProvider theme={theme}>
        <GlobalStyle />
        <Component {...pageProps} />
      </ThemeProvider>
    </>
  );
};

export default MyApp;
