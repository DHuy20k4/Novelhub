import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { toast } from "sonner"
import { useNavigate } from "react-router-dom"
import { Loader2 } from "lucide-react"

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
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

import { storyApi } from "@/features/novel/api/storyApi"
import { categoryApi } from "@/features/category/api/categoryApi"
import type { Category } from "@/features/category/api/categoryApi"
import { ImageUpload } from "@/components/shared/ImageUpload"

// Hàm tạo slug tự động từ tiếng Việt
function generateSlug(text: string) {
  return text
    .toLowerCase()
    .normalize('NFD') // Tách dấu ra khỏi chữ cái
    .replace(/[\u0300-\u036f]/g, '') // Xóa dấu
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9 ]/g, '') // Xóa ký tự đặc biệt
    .trim()
    .replace(/\s+/g, '-') // Đổi khoảng trắng thành dấu gạch ngang
}

const createStorySchema = z.object({
  title: z.string().min(3, { message: "Tên truyện phải có ít nhất 3 ký tự." }),
  slug: z.string().min(3, { message: "Slug không hợp lệ." }),
  summary: z.string().optional(),
  coverUrl: z.string().url({ message: "Vui lòng tải ảnh bìa lên." }).optional().or(z.literal("")),
  categoryIds: z.array(z.string()).min(1, { message: "Vui lòng chọn ít nhất 1 thể loại." }),
})

type CreateStoryValues = z.infer<typeof createStorySchema>

export function CreateStoryPage() {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])

  const form = useForm<CreateStoryValues>({
    resolver: zodResolver(createStorySchema),
    defaultValues: {
      title: "",
      slug: "",
      summary: "",
      coverUrl: "",
      categoryIds: [],
    },
  })

  // Theo dõi Title để tự động sinh Slug
  const titleValue = form.watch("title")
  useEffect(() => {
    if (titleValue && !form.formState.dirtyFields.slug) {
      form.setValue("slug", generateSlug(titleValue), { shouldValidate: true })
    }
  }, [titleValue, form])

  // Lấy danh sách thể loại từ API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await categoryApi.getAllCategories()
        if (res.success) {
          setCategories(res.data)
        }
      } catch (error) {
        toast.error("Không thể tải danh sách thể loại")
      }
    }
    fetchCategories()
  }, [])

  async function onSubmit(data: CreateStoryValues) {
    setIsLoading(true)
    try {
      const res = await storyApi.createStory({
        title: data.title,
        slug: data.slug,
        summary: data.summary,
        coverUrl: data.coverUrl || undefined,
        categoryIds: data.categoryIds,
      })

      if (res.success) {
        toast.success("Tạo truyện thành công!")
        // Chuyển hướng tới trang chi tiết truyện hoặc trang quản lý chương
        navigate(`/story/${res.data.slug}`)
      } else {
        toast.error(res.message || "Đã có lỗi xảy ra.")
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Tạo truyện thất bại.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container max-w-4xl py-10">
      <Card className="shadow-lg border-muted">
        <CardHeader>
          <CardTitle className="text-2xl">Đăng Truyện Mới</CardTitle>
          <CardDescription>Điền các thông tin cơ bản để bắt đầu tác phẩm của bạn.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              
              <div className="grid grid-cols-1 md:grid-cols-[160px_1fr] gap-8">
                {/* Cột trái: Upload Ảnh bìa */}
                <div>
                  <FormField
                    control={form.control}
                    name="coverUrl"
                    render={({ field }) => (
                      <FormItem className="flex flex-col items-center">
                        <FormLabel className="w-full text-left mb-2">Ảnh Bìa</FormLabel>
                        <FormControl>
                          <ImageUpload 
                            value={field.value} 
                            onChange={field.onChange} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Cột phải: Thông tin cơ bản */}
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tên Truyện <span className="text-destructive">*</span></FormLabel>
                        <FormControl>
                          <Input placeholder="Nhập tên truyện..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="slug"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Đường Dẫn (URL)</FormLabel>
                        <FormControl>
                          <Input placeholder="ten-truyen-khong-dau" {...field} />
                        </FormControl>
                        <FormDescription>
                          Đường dẫn này được dùng trên thanh địa chỉ. Hệ thống tự động tạo từ Tên Truyện.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="summary"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tóm Tắt Giới Thiệu</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Viết một đoạn ngắn gọn giới thiệu về bộ truyện của bạn..." 
                            className="min-h-[120px] resize-y"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Phần Thể loại */}
              <div className="border-t pt-6">
                <FormField
                  control={form.control}
                  name="categoryIds"
                  render={() => (
                    <FormItem>
                      <div className="mb-4">
                        <FormLabel className="text-base">Thể Loại <span className="text-destructive">*</span></FormLabel>
                        <FormDescription>
                          Chọn ít nhất một thể loại phù hợp với nội dung truyện.
                        </FormDescription>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {categories.map((item) => (
                          <FormField
                            key={item.id}
                            control={form.control}
                            name="categoryIds"
                            render={({ field }) => {
                              return (
                                <FormItem
                                  key={item.id}
                                  className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-3 shadow-sm cursor-pointer hover:bg-muted/50 transition-colors"
                                >
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(item.id)}
                                      onCheckedChange={(checked) => {
                                        return checked
                                          ? field.onChange([...field.value, item.id])
                                          : field.onChange(
                                              field.value?.filter(
                                                (value) => value !== item.id
                                              )
                                            )
                                      }}
                                    />
                                  </FormControl>
                                  <FormLabel className="font-normal cursor-pointer w-full">
                                    {item.name}
                                  </FormLabel>
                                </FormItem>
                              )
                            }}
                          />
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-end gap-4 border-t pt-6">
                <Button variant="outline" type="button" onClick={() => navigate(-1)}>
                  Hủy Bỏ
                </Button>
                <Button type="submit" disabled={isLoading || categories.length === 0}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Đăng Truyện Mới
                </Button>
              </div>

            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
