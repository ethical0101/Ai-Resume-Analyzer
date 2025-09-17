// Utility to format a byte count into a human-readable string in KB, MB, or GB
// Uses base 1024. Values are rounded to at most 2 decimal places.

import {twMerge} from "tailwind-merge";
import {type ClassValue, clsx} from "clsx";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export function utils(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 KB";

  const kb = bytes / 1024;
  if (kb < 1024) return `${formatNumber(kb)} KB`;

  const mb = kb / 1024;
  if (mb < 1024) return `${formatNumber(mb)} MB`;

  const gb = mb / 1024;
  return `${formatNumber(gb)} GB`;
}

function formatNumber(value: number): string {
  // Keep up to 2 decimals; trim trailing zeros and decimal point if unnecessary.
  const s = value.toFixed(2);
  return s.replace(/\.00$/, "").replace(/(\.\d)0$/, "$1");
}

export default utils;

export const generateUUID = () => crypto.randomUUID();


