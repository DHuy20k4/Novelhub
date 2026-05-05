import { Link } from "react-router-dom"

export function Footer() {
  return (
    <footer className="border-t py-6 md:py-8 mt-auto">
      <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex flex-col items-center md:items-start gap-1">
          <span className="font-bold text-xl text-primary">NovelHub</span>
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Web NovelHub. All rights reserved.
          </p>
        </div>
        
        <div className="flex gap-4 text-sm text-muted-foreground">
          <Link to="/terms" className="hover:text-foreground transition-colors">
            Điều khoản sử dụng
          </Link>
          <Link to="/privacy" className="hover:text-foreground transition-colors">
            Bảo mật
          </Link>
          <Link to="/contact" className="hover:text-foreground transition-colors">
            Liên hệ
          </Link>
        </div>
      </div>
    </footer>
  )
}
