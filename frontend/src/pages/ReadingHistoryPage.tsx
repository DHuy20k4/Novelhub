import { useState } from "react"
import { Link } from "react-router-dom"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Clock, BookOpen, Trash2, X, Loader2 } from "lucide-react"
import { toast } from "sonner"

import { readingHistoryApi } from "@/features/novel/api/readingHistoryApi"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export function ReadingHistoryPage() {
  const queryClient = useQueryClient()
  // Track từng item đang bị xóa để hiển thị spinner đúng chỗ
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ["reading-history"],
    queryFn: () => readingHistoryApi.getHistory(),
  })

  const history = data?.data || []

  const deleteMutation = useMutation({
    mutationFn: (storyId: string) => readingHistoryApi.deleteItem(storyId),
    onMutate: (storyId) => setDeletingId(storyId),
    onSuccess: () => {
      toast.success("Đã xóa khỏi lịch sử")
      queryClient.invalidateQueries({ queryKey: ["reading-history"] })
    },
    onError: () => toast.error("Xóa thất bại"),
    onSettled: () => setDeletingId(null),
  })

  const clearMutation = useMutation({
    mutationFn: () => readingHistoryApi.clearAll(),
    onSuccess: () => {
      toast.success("Đã xóa toàn bộ lịch sử đọc")
      queryClient.invalidateQueries({ queryKey: ["reading-history"] })
    },
    onError: () => toast.error("Xóa thất bại"),
  })

  // Format ngày an toàn — updatedAt có thể null
  const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return "—"
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) return "—"
    return d.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div className="container max-w-4xl py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 p-3 rounded-full">
            <Clock className="w-7 h-7 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Lịch sử đọc</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {isLoading
                ? "Đang tải..."
                : history.length > 0
                ? `${history.length} truyện đã đọc`
                : "Chưa có lịch sử"}
            </p>
          </div>
        </div>

        {history.length > 0 && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="text-destructive border-destructive/30 hover:bg-destructive/10"
                disabled={clearMutation.isPending}
              >
                {clearMutation.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4 mr-2" />
                )}
                Xóa tất cả
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Xóa toàn bộ lịch sử?</AlertDialogTitle>
                <AlertDialogDescription>
                  Hành động này không thể hoàn tác. Toàn bộ lịch sử đọc sẽ bị xóa vĩnh viễn.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Hủy</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => clearMutation.mutate()}
                  className="bg-destructive hover:bg-destructive/90"
                >
                  Xóa tất cả
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="space-y-3">
          {Array(6).fill(0).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-xl" />
          ))}
        </div>
      ) : history.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center border rounded-xl bg-muted/10 border-dashed">
          <BookOpen className="w-14 h-14 text-muted-foreground mb-4 opacity-40" />
          <h2 className="text-xl font-semibold mb-2">Chưa có lịch sử đọc</h2>
          <p className="text-muted-foreground mb-6 max-w-sm">
            Các truyện bạn đã đọc sẽ được lưu lại tại đây để tiếp tục đọc dễ dàng hơn.
          </p>
          <Button asChild>
            <Link to="/">Khám phá truyện ngay</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {history.map((item) => {
            const isDeleting = deletingId === item.storyId
            return (
              <div
                key={item.id}
                className="flex gap-4 p-4 rounded-xl border bg-card hover:shadow-sm transition-shadow group"
              >
                {/* Ảnh bìa */}
                <Link to={`/story/${item.story.slug}`} className="shrink-0">
                  <div className="w-14 h-20 rounded-md overflow-hidden bg-muted">
                    <img
                      src={item.story.coverUrl || "https://placehold.co/100x150/e2e8f0/1e293b?text=?"}
                      alt={item.story.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                </Link>

                {/* Thông tin */}
                <div className="flex-1 min-w-0">
                  <Link
                    to={`/story/${item.story.slug}`}
                    className="font-semibold text-foreground hover:text-primary transition-colors line-clamp-1"
                  >
                    {item.story.title}
                  </Link>
                  <p className="text-xs text-muted-foreground mt-0.5 mb-2">
                    {item.story.uploader.displayName} · {item.story.chapterCount} chương
                  </p>

                  {/* Chương đang đọc */}
                  <Link
                    to={`/story/${item.story.slug}/read/${item.chapter.id}`}
                    className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline underline-offset-2"
                  >
                    <BookOpen className="h-3.5 w-3.5 shrink-0" />
                    <span className="line-clamp-1">
                      Đang đọc: Chương {item.chapter.chapterIndex} — {item.chapter.title}
                    </span>
                  </Link>

                  <p className="text-xs text-muted-foreground mt-1.5 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatDate(item.updatedAt)}
                  </p>
                </div>

                {/* Nút xóa & đọc tiếp */}
                <div className="flex flex-col items-end justify-between gap-2 shrink-0">
                  <button
                    onClick={() => deleteMutation.mutate(item.storyId)}
                    disabled={isDeleting || clearMutation.isPending}
                    className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors opacity-0 group-hover:opacity-100 disabled:opacity-50"
                    title="Xóa khỏi lịch sử"
                  >
                    {isDeleting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <X className="h-4 w-4" />
                    )}
                  </button>

                  <Button size="sm" asChild>
                    <Link to={`/story/${item.story.slug}/read/${item.chapter.id}`}>
                      Đọc tiếp
                    </Link>
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
