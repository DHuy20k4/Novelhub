import { Link, Outlet, useLocation } from "react-router-dom"
import { LayoutDashboard, Tags, Users, Settings, LogOut, ArrowLeft } from "lucide-react"

import { useAuthStore } from "@/store/authStore"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export function AdminLayout() {
  const { user, logout } = useAuthStore()
  const location = useLocation()

  const navItems = [
    { name: "Tổng quan", path: "/admin", icon: LayoutDashboard },
    { name: "Thể loại", path: "/admin/categories", icon: Tags },
    { name: "Người dùng", path: "/admin/users", icon: Users },
    { name: "Cài đặt", path: "/admin/settings", icon: Settings },
  ]

  return (
    <div className="flex min-h-screen bg-muted/20">
      
      {/* Sidebar */}
      <aside className="w-64 bg-card border-r flex flex-col sticky top-0 h-screen hidden md:flex">
        <div className="p-6 border-b flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
            <Settings className="text-primary-foreground w-5 h-5" />
          </div>
          <span className="font-bold text-xl tracking-tight text-primary">Admin Panel</span>
        </div>
        
        <div className="flex-1 py-6 px-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                  isActive 
                    ? "bg-primary text-primary-foreground font-medium" 
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <item.icon className="w-5 h-5" />
                {item.name}
              </Link>
            )
          })}
        </div>

        <div className="p-4 border-t">
          <div className="flex items-center gap-3 mb-4">
            <Avatar>
              <AvatarImage src={user?.avatarUrl || ""} />
              <AvatarFallback>{user?.displayName?.charAt(0) || "A"}</AvatarFallback>
            </Avatar>
            <div className="overflow-hidden">
              <p className="text-sm font-medium truncate">{user?.displayName}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.role}</p>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link to="/">
                <ArrowLeft className="mr-2 h-4 w-4" /> Về trang chủ
              </Link>
            </Button>
            <Button variant="destructive" className="w-full justify-start" onClick={logout}>
              <LogOut className="mr-2 h-4 w-4" /> Đăng xuất
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-screen max-w-[100vw] md:max-w-[calc(100vw-16rem)]">
        <div className="flex-1 p-6 lg:p-10 overflow-x-hidden">
          <Outlet />
        </div>
      </main>

    </div>
  )
}
