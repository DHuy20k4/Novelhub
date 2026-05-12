
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { format } from "date-fns"
import { Check, X, Eye } from "lucide-react"
import { toast } from "sonner"
import { Link } from "react-router-dom"

import { storyApi, type Story } from "@/features/novel/api/storyApi"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export function AdminStories() {
  const queryClient = useQueryClient()
  const page = 1

  // Fetch pending stories
  const { data, isLoading } = useQuery({
    queryKey: ["admin-stories", "pending", page],
    queryFn: () => storyApi.getStories({ status: "pending", page, limit: 10 }),
  })

  // Approve/Reject Mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string, status: "approved" | "rejected" }) => 
      storyApi.updateStoryStatus(id, status),
    onSuccess: (res) => {
      toast.success(res.message)
      queryClient.invalidateQueries({ queryKey: ["admin-stories", "pending"] })
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Có lỗi xảy ra")
    }
  })

  const handleApprove = (id: string) => {
    if (window.confirm("Bạn có chắc chắn muốn duyệt truyện này?")) {
      updateStatusMutation.mutate({ id, status: "approved" })
    }
  }

  const handleReject = (id: string) => {
    if (window.confirm("Bạn có chắc chắn muốn từ chối truyện này?")) {
      updateStatusMutation.mutate({ id, status: "rejected" })
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Phê duyệt truyện</h2>
        <p className="text-muted-foreground">
          Quản lý và xét duyệt các truyện mới được tác giả đăng tải.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách chờ duyệt</CardTitle>
          <CardDescription>
            Tất cả truyện đang ở trạng thái pending.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : data?.data && data.data.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tên truyện</TableHead>
                    <TableHead>Tác giả</TableHead>
                    <TableHead>Ngày gửi</TableHead>
                    <TableHead>Thể loại</TableHead>
                    <TableHead className="text-right">Hành động</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.data.map((story: Story) => (
                    <TableRow key={story.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center space-x-2">
                          <span className="line-clamp-1">{story.title}</span>
                          <Link to={`/story/${story.slug}`} target="_blank">
                            <Button variant="ghost" size="icon" className="h-6 w-6">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                        </div>
                      </TableCell>
                      <TableCell>{story.uploader.displayName}</TableCell>
                      <TableCell>
                        {format(new Date(story.createdAt), "dd/MM/yyyy HH:mm")}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {story.categories.slice(0, 2).map(cat => (
                            <Badge key={cat.id} variant="secondary" className="text-xs">
                              {cat.name}
                            </Badge>
                          ))}
                          {story.categories.length > 2 && (
                            <Badge variant="secondary" className="text-xs">+{story.categories.length - 2}</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="default" 
                            size="sm" 
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => handleApprove(story.id)}
                            disabled={updateStatusMutation.isPending}
                          >
                            <Check className="mr-1 h-4 w-4" /> Duyệt
                          </Button>
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => handleReject(story.id)}
                            disabled={updateStatusMutation.isPending}
                          >
                            <X className="mr-1 h-4 w-4" /> Từ chối
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="py-10 text-center text-muted-foreground">
              Không có truyện nào đang chờ duyệt.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
