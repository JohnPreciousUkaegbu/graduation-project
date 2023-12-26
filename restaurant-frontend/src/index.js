import React, { lazy, Suspense } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Auth0Provider } from "@auth0/auth0-react";
import App from "./App";
import About from "./pages/About";
import Cart from "./pages/Cart";
import Error from "./pages/Error";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Restaurant from "./pages/Restaurant";
import Search from "./pages/Search";
import store from "./store/store";
import "./styles.css";
import Restaurants from "./pages/Restaurants";
import Signup from "./pages/Signup";
import Order from "./pages/Order";
import MenuItems from "./pages/MenuItems";

const Contact = lazy(() => import("./pages/Contact"));

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: "order",
        element: <Order />,
      },
      {
        path: "login",
        element: <Login />,
      },
      {
        path: "signup",
        element: <Signup />,
      },
      {
        path: "menu-items",
        element: <MenuItems />,
      },
    ],
    errorElement: <Error />,
  },
]);

const container = document.getElementById("root");
const root = createRoot(container);

root.render(
  <Auth0Provider
    domain={process.env.REACT_APP_DOMAIN}
    clientId={process.env.REACT_APP_CLIENT_ID}
    authorizationParams={{
      redirect_uri: window.location.origin,
    }}
  >
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  </Auth0Provider>
);
