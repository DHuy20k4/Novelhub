import { useState, useEffect } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { toast } from "sonner"
import { ArrowLeft, Loader2, Save } from "lucide-react"
import { useQuery } from "@tanstack/react-query"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

import { chapterApi } from "@/features/novel/api/chapterApi"

const chapterSchema = z.object({
  chapterIndex: z.coerce.number().min(1, "Số thứ tự chương phải lớn hơn 0"),
  title: z.string().min(1, "Tên chương không được để trống").max(255, "Tên chương quá dài"),
  content: z.string().min(10, "Nội dung chương quá ngắn (ít nhất 10 ký tự)"),
})

type ChapterFormValues = z.infer<typeof chapterSchema>

export function ChapterFormPage() {
  const { storyId, chapterId } = useParams<{ storyId: string; chapterId?: string }>()
  const navigate = useNavigate()
  const isEditing = !!chapterId
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<z.input<typeof chapterSchema>, undefined, ChapterFormValues>({
    resolver: zodResolver(chapterSchema),
    defaultValues: {
      chapterIndex: 1,
      title: "",
      content: "",
    },
  })

  // Fetch chapter data if editing
  const { data: chapterData, isLoading: isLoadingChapter } = useQuery({
    queryKey: ["chapter", chapterId],
    queryFn: () => chapterApi.getChapterById(chapterId!),
    enabled: isEditing,
  })

  useEffect(() => {
    if (isEditing && chapterData?.data) {
      const { chapterIndex, title, content } = chapterData.data
      form.reset({ chapterIndex, title, content })
    }
  }, [isEditing, chapterData, form])

  // Lấy danh sách chapter hiện tại để gợi ý số thứ tự chương tự động nếu tạo mới
  const { data: chaptersData } = useQuery({
    queryKey: ["chapters", storyId],
    queryFn: () => chapterApi.getChaptersByStoryId(storyId!),
    enabled: !isEditing && !!storyId,
  })

  useEffect(() => {
    if (!isEditing && chaptersData?.data) {
      const maxIndex = chaptersData.data.reduce((max, ch) => Math.max(max, ch.chapterIndex), 0)
      form.setValue("chapterIndex", maxIndex + 1)
    }
  }, [isEditing, chaptersData, form])

  async function onSubmit(data: ChapterFormValues) {
    if (!storyId) return

    setIsSubmitting(true)
    try {
      if (isEditing) {
        await chapterApi.updateChapter(chapterId!, data)
        toast.success("Cập nhật chương thành công!")
      } else {
        await chapterApi.createChapter(storyId, data)
        toast.success("Thêm chương mới thành công!")
      }
      navigate(`/studio/story/${storyId}/chapters`)
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error?.response?.data?.message || "Có lỗi xảy ra khi lưu chương.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isEditing && isLoadingChapter) {
    return (
      <div className="container py-20 flex justify-center items-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="container max-w-4xl py-10 space-y-6">

      <Button variant="ghost" className="w-fit -ml-4" asChild>
        <Link to={`/studio/story/${storyId}/chapters`}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Quay lại danh sách chương
        </Link>
      </Button>

      <Card className="shadow-lg border-muted">
        <CardHeader>
          <CardTitle className="text-2xl">
            {isEditing ? "Chỉnh sửa chương" : "Thêm chương mới"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="md:col-span-1">
                  <FormField
                    control={form.control}
                    name="chapterIndex"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Số chương <span className="text-destructive">*</span></FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min={1} 
                            {...field} 
                            value={field.value as number | string} 
                            onFocus={(e) => e.target.select()}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="md:col-span-3">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tên chương <span className="text-destructive">*</span></FormLabel>
                        <FormControl>
                          <Input placeholder="VD: Vạn Vật Sinh Trưởng..." {...field} />
                        </FormControl>
                        <FormDescription>Tên chương không cần bao gồm "Chương X", hệ thống sẽ tự ghép số chương.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nội dung <span className="text-destructive">*</span></FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Nhập nội dung chương truyện vào đây..."
                        className="min-h-[400px] resize-y leading-relaxed font-serif text-base"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-4 pt-4 border-t">
                <Button variant="outline" type="button" asChild>
                  <Link to={`/studio/story/${storyId}/chapters`}>Hủy Bỏ</Link>
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="mr-2 h-4 w-4" />
                  )}
                  {isEditing ? "Lưu Thay Đổi" : "Đăng Chương"}
                </Button>
              </div>

            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
