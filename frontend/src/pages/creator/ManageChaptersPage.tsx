import { useState } from "react"
import { useParams, Link } from "react-router-dom"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { PlusCircle, Edit, Trash2, ArrowLeft, GripVertical } from "lucide-react"
import { toast } from "sonner"

import { chapterApi } from "@/features/novel/api/chapterApi"
import { storyApi } from "@/features/novel/api/storyApi"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent } from "@/components/ui/card"
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

export function ManageChaptersPage() {
  const { storyId } = useParams<{ storyId: string }>()
  const queryClient = useQueryClient()
  const [deletingId, setDeletingId] = useState<string | null>(null)

  // Fetch story info
  const { data: storyData } = useQuery({
    queryKey: ["story", storyId],
    queryFn: () => storyApi.getStoryById(storyId!),
    enabled: !!storyId,
  })

  // Fetch chapters
  const { data: chaptersData, isLoading } = useQuery({
    queryKey: ["chapters", storyId],
    queryFn: () => chapterApi.getChaptersByStoryId(storyId!),
    enabled: !!storyId,
  })

  const story = storyData?.data
  const chapters = chaptersData?.data || []

  // Xóa chương
  const deleteMutation = useMutation({
    mutationFn: (chapterId: string) => chapterApi.deleteChapter(chapterId),
    onSuccess: () => {
      toast.success("Đã xóa chương thành công")
      queryClient.invalidateQueries({ queryKey: ["chapters", storyId] })
    },
    onError: () => {
      toast.error("Xóa chương thất bại")
    },
    onSettled: () => {
      setDeletingId(null)
    }
  })

  const handleDelete = (chapterId: string) => {
    setDeletingId(chapterId)
    deleteMutation.mutate(chapterId)
  }

  return (
    <div className="container max-w-4xl py-10 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col gap-4">
        <Button variant="ghost" className="w-fit -ml-4" asChild>
          <Link to="/studio">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Quay lại Studio
          </Link>
        </Button>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Quản lý chương</h1>
            <p className="text-muted-foreground mt-1">
              Truyện: <span className="font-semibold text-foreground">{story?.title || "Đang tải..."}</span>
            </p>
          </div>
          <Button asChild>
            <Link to={`/studio/story/${storyId}/chapter/create`}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Thêm Chương Mới
            </Link>
          </Button>
        </div>
      </div>

      {/* Chapters List */}
      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-16 w-full rounded-xl" />
          <Skeleton className="h-16 w-full rounded-xl" />
          <Skeleton className="h-16 w-full rounded-xl" />
        </div>
      ) : chapters.length > 0 ? (
        <div className="bg-card border rounded-xl overflow-hidden shadow-sm">
          {chapters.map((chapter, index) => (
            <div 
              key={chapter.id} 
              className={`flex items-center justify-between p-4 ${
                index !== chapters.length - 1 ? "border-b" : ""
              } hover:bg-muted/50 transition-colors`}
            >
              <div className="flex items-center gap-4">
                <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab opacity-50" />
                <div>
                  <h4 className="font-semibold">
                    Chương {chapter.chapterIndex}: {chapter.title}
                  </h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    Cập nhật: {new Date(chapter.updatedAt).toLocaleDateString("vi-VN")} • {chapter.viewCount} lượt xem
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" asChild>
                  <Link to={`/studio/story/${storyId}/chapter/${chapter.id}/edit`}>
                    <Edit className="h-4 w-4" />
                    <span className="sr-only sm:not-sr-only sm:ml-2">Sửa</span>
                  </Link>
                </Button>
                
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm" disabled={deletingId === chapter.id}>
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only sm:not-sr-only sm:ml-2">Xóa</span>
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Xóa chương truyện?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Hành động này không thể hoàn tác. Chương này sẽ bị xóa vĩnh viễn khỏi cơ sở dữ liệu.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Hủy</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDelete(chapter.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                        Chắc chắn xóa
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <Card className="border-dashed">
          <CardContent className="py-20 flex flex-col items-center justify-center text-center">
            <h3 className="text-lg font-semibold mb-2">Chưa có chương nào</h3>
            <p className="text-muted-foreground mb-6 max-w-md">
              Bộ truyện này chưa có nội dung. Hãy thêm chương đầu tiên để độc giả có thể bắt đầu theo dõi tác phẩm của bạn.
            </p>
            <Button asChild>
              <Link to={`/studio/story/${storyId}/chapter/create`}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Thêm Chương Đầu Tiên
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

    </div>
  )
}
