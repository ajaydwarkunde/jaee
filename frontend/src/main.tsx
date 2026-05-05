import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster, ToastBar, toast as hotToast } from 'react-hot-toast'
import { X } from 'lucide-react'
import App from './App'
import './index.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#2D2D2D',
              color: '#FBF6F3',
              borderRadius: '12px',
              padding: '12px 16px',
              fontSize: '14px',
              maxWidth: 'min(100vw - 32px, 380px)',
            },
            success: {
              iconTheme: { primary: '#6B9E76', secondary: '#FBF6F3' },
            },
            error: {
              iconTheme: { primary: '#C44D4D', secondary: '#FBF6F3' },
            },
          }}
        >
          {(t) => (
            <ToastBar toast={t}>
              {({ icon, message }) => (
                <div className="flex items-start gap-2 w-full pr-1">
                  <span className="shrink-0 mt-0.5">{icon}</span>
                  <div className="flex-1 min-w-0 pt-0.5">{message}</div>
                  <button
                    type="button"
                    className="shrink-0 p-1 rounded-md hover:bg-black/10 text-[#363636] opacity-80 hover:opacity-100"
                    aria-label="Dismiss notification"
                    onClick={() => hotToast.dismiss(t.id)}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </ToastBar>
          )}
        </Toaster>
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>,
)
