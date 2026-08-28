"use client";

import { useEffect, useState } from "react";

type ToastProps = {
  message: string;
  type?: "success" | "error" | "info" | "warning";
  duration?: number;
  onClose?: () => void;
};

export function Toast({ message, type = "info", duration = 3000, onClose }: ToastProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      if (onClose) onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  if (!visible) return null;

  const colors = {
    success: "bg-green-500",
    error: "bg-red-500",
    warning: "bg-yellow-500",
    info: "bg-blue-500",
  };

  const icons = {
    success: "✅",
    error: "❌",
    warning: "⚠️",
    info: "ℹ️",
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-slide-up">
      <div className={`${colors[type]} text-white px-6 py-4 rounded-xl shadow-lg flex items-center gap-3 max-w-sm`}>
        <span className="text-xl">{icons[type]}</span>
        <span className="text-sm font-medium">{message}</span>
      </div>
    </div>
  );
}

// 全局 Toast 管理
let toastContainer: HTMLDivElement | null = null;
let toastRoot: any = null;

export function showToast(message: string, type: "success" | "error" | "info" | "warning" = "info", duration = 3000) {
  // 动态导入 ReactDOM 来渲染
  import("react-dom/client").then(({ createRoot }) => {
    // 移除已有 toast
    if (toastRoot) {
      toastRoot.unmount();
      toastRoot = null;
    }
    if (toastContainer) {
      toastContainer.remove();
      toastContainer = null;
    }

    // 创建容器
    toastContainer = document.createElement("div");
    document.body.appendChild(toastContainer);

    // 渲染 Toast
    const root = createRoot(toastContainer);
    toastRoot = root;

    root.render(
      <Toast
        message={message}
        type={type}
        duration={duration}
        onClose={() => {
          if (toastRoot) {
            toastRoot.unmount();
            toastRoot = null;
          }
          if (toastContainer) {
            toastContainer.remove();
            toastContainer = null;
          }
        }}
      />
    );
  });
}