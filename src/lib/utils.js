import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

// The `cn` helper every shadcn/Magic UI component imports from '@/lib/utils'.
// clsx flattens conditional class arguments; twMerge resolves Tailwind classes
// that fight each other, so a className passed by a caller beats the
// component's own default instead of depending on stylesheet order.
export function cn(...inputs) {
  return twMerge(clsx(inputs))
}
