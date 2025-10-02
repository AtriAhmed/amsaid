"use client";

import React from "react";
import {
  CheckCircle,
  AlertCircle,
  Upload,
  FileVideo,
  Image,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";

export type UploadStatus = "idle" | "uploading" | "success" | "error";
export type UploadFileType = "poster" | "video" | null;

interface UploadProgressIndicatorProps {
  status: UploadStatus;
  progress: number;
  fileType?: UploadFileType;
}

const UploadProgressIndicator: React.FC<UploadProgressIndicatorProps> = ({
  status,
  progress,
  fileType,
}) => {
  if (status === "idle") return null;

  const getStatusContent = () => {
    switch (status) {
      case "uploading":
        return {
          icon: (
            <div className="relative">
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-600 border-t-transparent"></div>
            </div>
          ),
          text: "جاري الرفع...",
          color: "text-blue-700",
        };
      case "success":
        return {
          icon: (
            <div className="relative">
              <CheckCircle className="h-5 w-5" />
            </div>
          ),
          text: "تم الرفع بنجاح!",
          color: "text-green-700",
        };
      case "error":
        return {
          icon: (
            <div className="relative">
              <AlertCircle className="h-5 w-5" />
            </div>
          ),
          text: "حدث خطأ أثناء الرفع",
          color: "text-red-700",
        };
      default:
        return null;
    }
  };

  const getFileTypeContent = () => {
    switch (fileType) {
      case "poster":
        return {
          icon: <Image className="h-4 w-4 text-blue-600" />,
          text: "رفع الصورة المصغرة",
          bgColor: "bg-blue-100",
        };
      case "video":
        return {
          icon: <FileVideo className="h-4 w-4 text-purple-600" />,
          text: "رفع ملف الفيديو",
          bgColor: "bg-purple-100",
        };
      default:
        return {
          icon: <Upload className="h-4 w-4 text-indigo-600" />,
          text: "رفع البيانات",
          bgColor: "bg-indigo-100",
        };
    }
  };

  const getProgressMessage = () => {
    return "جاري التحميل...";
  };

  const statusContent = getStatusContent();
  const fileTypeContent = getFileTypeContent();

  if (!statusContent) return null;

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-blue-50/80 via-indigo-50/60 to-purple-50/40 border border-blue-200/50 rounded-xl shadow-sm backdrop-blur-sm p-4">
      {/* Always show subtle background pattern */}
      <div className="absolute inset-0 opacity-[0.03]">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-600 transform skew-y-6 scale-110"></div>
      </div>

      <div className="relative z-10">
        <div
          className={`flex items-center justify-between ${
            status === "uploading" ? "mb-3" : ""
          }`}
        >
          <div className={`flex items-center gap-3 ${statusContent.color}`}>
            {statusContent.icon}
            <div>
              <span className="font-semibold text-sm">
                {statusContent.text}
              </span>
            </div>
          </div>

          {status === "uploading" && (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-2 py-1 bg-white/60 rounded-lg border border-blue-100/50">
                <div className={`p-1.5 ${fileTypeContent.bgColor} rounded-md`}>
                  {fileTypeContent.icon}
                </div>
                <span className="text-xs font-medium text-gray-700">
                  {fileTypeContent.text}
                </span>
              </div>
              <div className="text-right">
                <div className="font-bold text-lg text-blue-700 tabular-nums">
                  {progress}%
                </div>
              </div>
            </div>
          )}
        </div>

        {status === "uploading" && (
          <div className="space-y-3">
            <div className="relative">
              <Progress
                value={progress}
                className="w-full bg-white/60 shadow-inner rounded-full border border-blue-100/50 h-2.5"
              />
              {/* Shimmer effect on progress bar */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse rounded-full"></div>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center gap-2 text-xs font-medium text-gray-600 bg-white/50 backdrop-blur-sm border border-white/20 px-3 py-1.5 rounded-full">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></div>
                {getProgressMessage()}
              </div>
            </div>
          </div>
        )}

        {status === "success" && (
          <div className="text-center">
            <div className="inline-flex items-center gap-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-full font-medium shadow-lg backdrop-blur-sm px-4 py-2.5 text-sm">
              <CheckCircle className="h-4 w-4" />
              <span>تم حفظ الفيديو بنجاح!</span>
              <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            </div>
          </div>
        )}

        {status === "error" && (
          <div className="text-center">
            <div className="inline-flex items-center gap-3 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-full font-medium shadow-lg backdrop-blur-sm px-4 py-2.5 text-sm">
              <AlertCircle className="h-4 w-4" />
              <span>فشل في رفع الملف. حاول مرة أخرى.</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UploadProgressIndicator;
