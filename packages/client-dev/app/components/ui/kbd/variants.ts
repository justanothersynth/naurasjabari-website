import { cva  } from 'class-variance-authority'
import type {VariantProps} from 'class-variance-authority';

export const kbdVariants = cva(
  'inline-flex items-center font-sans text-xs font-medium',
  {
    variants: {
      variant: {
        default: 'rounded-sm border px-1.5 py-0.5',
        square: 'rounded border w-6.5 h-6 justify-center'
      },
      theme: {
        light: 'border-gray-200 text-gray-400',
        dark: 'border-gray-600 text-gray-400',
        contrast: 'border-gray-400 text-gray-300'
      }
    },
    defaultVariants: {
      variant: 'default',
      theme: 'light'
    }
  }
)

export type KbdVariants = VariantProps<typeof kbdVariants>
