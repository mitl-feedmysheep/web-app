import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, "");
  const match = cleaned.match(/^(\d{3})(\d{4})(\d{4})$/);
  return match ? `${match[1]}-${match[2]}-${match[3]}` : phone;
}

export function convertKSTtoUTC(dateStr: string, timeStr: string): string {
  const kstDateTime = new Date(`${dateStr}T${timeStr}:00+09:00`);
  return kstDateTime.toISOString();
}

export function getWeekOfMonth(dateString: string): number {
  try {
    const date = new Date(dateString);
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
    return Math.ceil((date.getDate() + firstDay.getDay()) / 7);
  } catch {
    return 1;
  }
}

export function formatWeekFormat(dateString: string): string {
  try {
    const date = new Date(dateString);
    const year = String(date.getFullYear()).slice(-2);
    const month = date.getMonth() + 1;
    const week = getWeekOfMonth(dateString);
    return `${year}년 ${month}월 ${week}주차`;
  } catch {
    return "25년 1월 1주차";
  }
}

export function resizeImage(
  file: File,
  targetWidth: number,
  targetHeight: number,
  quality: number = 0.9
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    const objectUrl = URL.createObjectURL(file);
    img.src = objectUrl;

    const cleanup = () => URL.revokeObjectURL(objectUrl);

    img.onload = () => {
      cleanup();
      canvas.width = targetWidth;
      canvas.height = targetHeight;

      if (!ctx) {
        reject(new Error("Canvas context not available"));
        return;
      }

      ctx.fillStyle = "#F5F7F5";
      ctx.fillRect(0, 0, targetWidth, targetHeight);

      const imgAspect = img.width / img.height;
      const targetAspect = targetWidth / targetHeight;

      let drawWidth = targetWidth;
      let drawHeight = targetHeight;
      let drawX = 0;
      let drawY = 0;

      if (imgAspect > targetAspect) {
        drawHeight = targetWidth / imgAspect;
        drawY = (targetHeight - drawHeight) / 2;
      } else {
        drawWidth = targetHeight * imgAspect;
        drawX = (targetWidth - drawWidth) / 2;
      }

      ctx.drawImage(img, 0, 0, img.width, img.height, drawX, drawY, drawWidth, drawHeight);

      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob);
          else reject(new Error("Failed to create blob from canvas"));
        },
        file.type,
        quality
      );
    };

    img.onerror = () => {
      cleanup();
      reject(new Error("Failed to load image"));
    };
  });
}

export const storage = {
  get: (key: string) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch {
      return null;
    }
  },
  set: (key: string, value: unknown) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* ignore */
    }
  },
  remove: (key: string) => {
    try {
      localStorage.removeItem(key);
    } catch {
      /* ignore */
    }
  },
};
