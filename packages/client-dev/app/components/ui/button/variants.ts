import { cva } from 'class-variance-authority'
import type { VariantProps } from 'class-variance-authority'

export const buttonVariants = cva(
  'cursor-pointer whitespace-nowrap transition-colors duration-150 ease-in-out',
  {
    variants: {
      variant: {
        bare: '',
        default: 'py-1 px-2 rounded-full flex items-center gap-1 hover:underline text-[14px]'
      },
      selected: {
        true: '',
        false: ''
      },
      disabled: {
        true: '',
        false: ''
      },
      size: {
        default: '',
        medium: 'text-lg [&_.iconify]:!text-lg px-3'
      }
    },
    compoundVariants: [
      {
        variant: 'default',
        selected: false,
        disabled: false,
        class: 'hover:bg-gray-200'
      },
      {
        variant: 'default',
        selected: true,
        disabled: false,
        class: 'bg-gray-100 cursor-default hover:no-underline'
      }
    ],
    defaultVariants: {
      variant: 'default'
    }
  }
)

export type ButtonVariants = VariantProps<typeof buttonVariants>
