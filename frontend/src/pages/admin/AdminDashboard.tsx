import { useQuery } from "@tanstack/react-query"
import { Users, BookOpen, Layers, LibraryBig, TrendingUp } from "lucide-react"

import { adminApi } from "@/features/admin/api/adminApi"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function AdminDashboard() {
  const { data: statsData, isLoading } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: () => adminApi.getStats(),
  })

  const stats = statsData?.data

  const statCards = [
    {
      title: "Tổng Người Dùng",
      value: stats?.users || 0,
      icon: Users,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
      description: "+2% so với tháng trước",
    },
    {
      title: "Tổng Truyện",
      value: stats?.stories || 0,
      icon: BookOpen,
      color: "text-orange-500",
      bg: "bg-orange-500/10",
      description: "Có 5 truyện mới tuần này",
    },
    {
      title: "Tổng Chương",
      value: stats?.chapters || 0,
      icon: LibraryBig,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
      description: "Được cập nhật liên tục",
    },
    {
      title: "Thể Loại",
      value: stats?.categories || 0,
      icon: Layers,
      color: "text-purple-500",
      bg: "bg-purple-500/10",
      description: "Bao quát nhiều chủ đề",
    },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard Thống Kê</h1>
        <p className="text-muted-foreground mt-1">Cái nhìn tổng quan về tình trạng hệ thống NovelHub.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {isLoading
          ? Array(4)
              .fill(0)
              .map((_, i) => <Skeleton key={i} className="h-32 w-full rounded-xl" />)
          : statCards.map((item, index) => (
              <Card key={index}>
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {item.title}
                  </CardTitle>
                  <div className={`p-2 rounded-lg ${item.bg}`}>
                    <item.icon className={`h-4 w-4 ${item.color}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{item.value.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground mt-1 flex items-center">
                    <TrendingUp className="h-3 w-3 mr-1 text-emerald-500" />
                    {item.description}
                  </p>
                </CardContent>
              </Card>
            ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <Card className="col-span-1 border-dashed">
          <CardHeader>
            <CardTitle>Biểu đồ truy cập</CardTitle>
          </CardHeader>
          <CardContent className="h-64 flex items-center justify-center text-muted-foreground">
            Biểu đồ sẽ được cập nhật ở phiên bản sau
          </CardContent>
        </Card>
        <Card className="col-span-1 border-dashed">
          <CardHeader>
            <CardTitle>Hoạt động gần đây</CardTitle>
          </CardHeader>
          <CardContent className="h-64 flex items-center justify-center text-muted-foreground">
            Danh sách hoạt động sẽ được cập nhật ở phiên bản sau
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
