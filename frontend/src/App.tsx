import { ThemeProvider } from "./components/theme-provider"
import { ModeToggle } from "./components/mode-toggle"
import { Button } from "./components/ui/button"

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="novelhub-theme">
      <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-4 gap-6">
        <h1 className="text-4xl font-bold tracking-tight text-primary">Web NovelHub</h1>
        <p className="text-muted-foreground max-w-md text-center">
          Dự án React + Vite + TailwindCSS + Shadcn/ui đã khởi tạo thành công!
        </p>
        
        <div className="flex gap-4 items-center">
          <Button>Bắt đầu đọc truyện</Button>
          <Button variant="secondary">Đăng nhập</Button>
          <ModeToggle />
        </div>
      </div>
    </ThemeProvider>
  )
}

export default App
