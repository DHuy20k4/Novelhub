import { BrowserRouter } from "react-router-dom"
import { ThemeProvider } from "./components/theme-provider"
import { AppRoutes } from "./routes"
import { Toaster } from "@/components/ui/sonner"

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="novelhub-theme">
      <BrowserRouter>
        <AppRoutes />
        <Toaster position="top-center" richColors />
      </BrowserRouter>
    </ThemeProvider>
  )
}

export default App
