import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Plus, Edit, Trash2, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"

import { adminApi } from "@/features/admin/api/adminApi"
import { categoryApi } from "@/features/category/api/categoryApi"
import type { Category } from "@/features/category/api/categoryApi"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form"
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

// Helper tự động sinh slug từ name
function generateSlug(text: string) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9 ]/g, '')
    .trim()
    .replace(/\s+/g, '-')
}

const categorySchema = z.object({
  name: z.string().min(2, "Tên thể loại quá ngắn"),
  slug: z.string().min(2, "Slug không hợp lệ"),
})

export function AdminCategories() {
  const queryClient = useQueryClient()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const form = useForm<z.infer<typeof categorySchema>>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: "",
      slug: "",
    },
  })

  // Watch name to auto-generate slug for new categories
  const nameValue = form.watch("name")
  if (!editingCategory && nameValue && !form.formState.dirtyFields.slug) {
    form.setValue("slug", generateSlug(nameValue), { shouldValidate: true })
  }

  // Fetch categories
  const { data: categoriesData, isLoading } = useQuery({
    queryKey: ["admin-categories"],
    queryFn: () => categoryApi.getAllCategories(),
  })
  const categories = categoriesData?.data || []

  // Create Mutation
  const createMutation = useMutation({
    mutationFn: (data: { name: string; slug: string }) => adminApi.createCategory(data),
    onSuccess: () => {
      toast.success("Thêm thể loại thành công")
      queryClient.invalidateQueries({ queryKey: ["admin-categories"] })
      queryClient.invalidateQueries({ queryKey: ["categories"] })
      closeDialog()
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Thêm thất bại")
    }
  })

  // Update Mutation
  const updateMutation = useMutation({
    mutationFn: (data: { id: string; payload: { name: string; slug: string } }) => 
      adminApi.updateCategory(data.id, data.payload),
    onSuccess: () => {
      toast.success("Cập nhật thành công")
      queryClient.invalidateQueries({ queryKey: ["admin-categories"] })
      queryClient.invalidateQueries({ queryKey: ["categories"] })
      closeDialog()
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Cập nhật thất bại")
    }
  })

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminApi.deleteCategory(id),
    onSuccess: () => {
      toast.success("Xóa thể loại thành công")
      queryClient.invalidateQueries({ queryKey: ["admin-categories"] })
      queryClient.invalidateQueries({ queryKey: ["categories"] })
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Xóa thất bại")
    },
    onSettled: () => setDeletingId(null)
  })

  const openDialog = (category?: Category) => {
    if (category) {
      setEditingCategory(category)
      form.reset({ name: category.name, slug: category.slug })
    } else {
      setEditingCategory(null)
      form.reset({ name: "", slug: "" })
    }
    setIsDialogOpen(true)
  }

  const closeDialog = () => {
    setIsDialogOpen(false)
    setTimeout(() => {
      setEditingCategory(null)
      form.reset({ name: "", slug: "" })
    }, 200)
  }

  const onSubmit = (values: z.infer<typeof categorySchema>) => {
    if (editingCategory) {
      updateMutation.mutate({ id: editingCategory.id, payload: values })
    } else {
      createMutation.mutate(values)
    }
  }

  const handleDelete = (id: string) => {
    setDeletingId(id)
    deleteMutation.mutate(id)
  }

  const isSubmitting = createMutation.isPending || updateMutation.isPending

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Quản lý Thể Loại</h1>
          <p className="text-muted-foreground mt-1">
            Thêm, sửa, xóa các thể loại truyện trên hệ thống.
          </p>
        </div>
        <Button onClick={() => openDialog()}>
          <Plus className="mr-2 h-4 w-4" />
          Thêm Thể Loại
        </Button>
      </div>

      <div className="border rounded-md bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">#</TableHead>
              <TableHead>Tên Thể Loại</TableHead>
              <TableHead>Đường dẫn (Slug)</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array(5).fill(0).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-4" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[150px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[150px]" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="h-8 w-20 ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : categories.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                  Chưa có thể loại nào.
                </TableCell>
              </TableRow>
            ) : (
              categories.map((cat, index) => (
                <TableRow key={cat.id}>
                  <TableCell className="font-medium">{index + 1}</TableCell>
                  <TableCell className="font-semibold">{cat.name}</TableCell>
                  <TableCell className="text-muted-foreground">{cat.slug}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => openDialog(cat)}>
                        <Edit className="h-4 w-4" />
                      </Button>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="sm" disabled={deletingId === cat.id}>
                            {deletingId === cat.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Xóa thể loại "{cat.name}"?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Hành động này không thể hoàn tác. Các truyện thuộc thể loại này sẽ bị mất liên kết với thể loại này.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Hủy</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(cat.id)} className="bg-destructive hover:bg-destructive/90">
                              Xác nhận xóa
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingCategory ? "Sửa Thể Loại" : "Thêm Thể Loại Mới"}</DialogTitle>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tên thể loại <span className="text-destructive">*</span></FormLabel>
                    <FormControl>
                      <Input placeholder="VD: Tiên Hiệp" {...field} />
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
                    <FormLabel>Đường dẫn (Slug) <span className="text-destructive">*</span></FormLabel>
                    <FormControl>
                      <Input placeholder="tien-hiep" {...field} />
                    </FormControl>
                    <FormDescription>Dùng trên URL, hệ thống tự sinh nếu tạo mới.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter className="pt-4">
                <Button type="button" variant="outline" onClick={closeDialog}>
                  Hủy
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Lưu thay đổi
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
