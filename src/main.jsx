import React from "react";
import ReactDOM from "react-dom/client";
import { Toaster } from 'react-hot-toast';
import App from "./App";
import "./index.css";

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
const queryClient = new QueryClient();
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
        }}
      />
    </>
  </React.StrictMode>
);