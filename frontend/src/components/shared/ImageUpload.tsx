import React, { useState, useRef } from "react";
import { UploadCloud, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { uploadApi } from "@/features/upload/api/uploadApi";
import { Button } from "@/components/ui/button";

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  className?: string;
}

export function ImageUpload({ value, onChange, className = "" }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Vui lòng chọn file hình ảnh hợp lệ (JPG, PNG, WebP...)");
      return;
    }

    // Validate file size (e.g., max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Kích thước ảnh không được vượt quá 5MB");
      return;
    }

    setIsUploading(true);
    try {
      const res = await uploadApi.uploadImage(file);
      if (res.success && res.url) {
        onChange(res.url);
        toast.success("Tải ảnh lên thành công!");
      } else {
        toast.error(res.message || "Tải ảnh thất bại!");
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Có lỗi xảy ra khi tải ảnh lên");
    } finally {
      setIsUploading(false);
      if (inputRef.current) {
        inputRef.current.value = ""; // Reset input so same file can be selected again
      }
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange("");
  };

  return (
    <div className={`w-full ${className}`}>
      <input
        type="file"
        ref={inputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />
      
      {value ? (
        <div className="relative group rounded-xl overflow-hidden border w-40 aspect-[2/3] flex-shrink-0">
          <img src={value} alt="Preview" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <Button 
              type="button" 
              variant="destructive" 
              size="icon" 
              className="w-8 h-8 rounded-full" 
              onClick={handleRemove}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      ) : (
        <div 
          onClick={() => inputRef.current?.click()}
          className="border-2 border-dashed rounded-xl w-40 aspect-[2/3] flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-muted/50 transition-colors text-muted-foreground hover:text-primary hover:border-primary/50"
        >
          {isUploading ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <span className="text-xs font-medium">Đang tải...</span>
            </div>
          ) : (
            <>
              <UploadCloud className="w-8 h-8" />
              <span className="text-xs font-medium text-center px-2">Nhấn để tải ảnh bìa</span>
            </>
          )}
        </div>
      )}
    </div>
  );
}
