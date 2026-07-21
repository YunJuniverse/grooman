import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * cn — 조건부 클래스 병합 유틸.
 * clsx로 조건부/배열 클래스를 합치고, twMerge로 Tailwind 충돌(뒤 클래스 우선)을 해소.
 * deps: clsx, tailwind-merge
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
