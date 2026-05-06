import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Search, Shield, ShieldAlert, CheckCircle2, Ban } from "lucide-react"

import { adminApi } from "@/features/admin/api/adminApi"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export function AdminUsers() {
  const [page, setPage] = useState(1)
  const [limit] = useState(10)
  
  const { data: usersData, isLoading } = useQuery({
    queryKey: ["admin-users", page, limit],
    queryFn: () => adminApi.getAllUsers({ page, limit }),
  })

  const users = usersData?.data || []
  const meta = usersData?.meta

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Quản lý Người Dùng</h1>
          <p className="text-muted-foreground mt-1">
            Xem danh sách và trạng thái của tất cả người dùng hệ thống.
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-card p-4 rounded-md border">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Tìm kiếm người dùng (tạm vô hiệu hóa)..." className="pl-8" disabled />
        </div>
        <div className="flex gap-4 w-full sm:w-auto">
          <Select disabled>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Vai trò" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="user">User</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="border rounded-md bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Người dùng</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Vai trò</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead className="text-center">Số truyện</TableHead>
              <TableHead className="text-right">Ngày tham gia</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array(5).fill(0).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-[150px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[200px]" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-16 rounded-full" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-8 mx-auto" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="h-4 w-24 ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                  Không tìm thấy người dùng nào.
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="font-semibold">{user.displayName}</div>
                    <div className="text-xs text-muted-foreground">@{user.username}</div>
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge variant={user.role === "admin" ? "default" : "secondary"} className="capitalize">
                      {user.role === "admin" ? <ShieldAlert className="w-3 h-3 mr-1" /> : <Shield className="w-3 h-3 mr-1" />}
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {user.isBanned ? (
                      <Badge variant="destructive" className="bg-red-500/10 text-red-500 hover:bg-red-500/20">
                        <Ban className="w-3 h-3 mr-1" /> Bị cấm
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-emerald-500 border-emerald-200 bg-emerald-500/10">
                        <CheckCircle2 className="w-3 h-3 mr-1" /> Hoạt động
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-center font-medium">
                    {user._count?.stories || 0}
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {new Date(user.createdAt).toLocaleDateString("vi-VN")}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-end space-x-2 py-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Trang trước
          </Button>
          <div className="text-sm text-muted-foreground">
            Trang {page} / {meta.totalPages}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
            disabled={page === meta.totalPages}
          >
            Trang sau
          </Button>
        </div>
      )}
    </div>
  )
}
