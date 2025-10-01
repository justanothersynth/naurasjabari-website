import { cva  } from 'class-variance-authority'
import type { VariantProps } from 'class-variance-authority'

export const buttonVariants = cva(
  'cursor-pointer whitespace-nowrap transition-colors duration-150 ease-in-out',
  {
    variants: {
      variant: {
        bare: '',
        default: 'py-2 px-3',
        sidebar: 'rounded-xl p-1.5 aspect-square w-10 h-10',
        link: 'text-dark underline-offset-4 hover:underline',
        form: 'py-2 px-3 bg-gray-200'
      },
      selected: {
        true: 'bg-white cursor-default',
        false: ''
      },
      disabled: {
        true: 'disabled:opacity-50 cursor-not-allowed',
        false: ''
      },
      size: {
        default: '',
        icon: 'size-9'
      }
    },
    compoundVariants: [
      {
        variant: 'sidebar',
        selected: false,
        disabled: false,
        class: 'hover:bg-gray-100'
      },
      {
        variant: 'sidebar',
        selected: true,
        disabled: false,
        class: 'bg-gray-900 text-white'
      },
      {
        variant: 'form',
        disabled: false,
        class: 'hover:bg-gray-500 hover:text-white'
      }
    ],
    defaultVariants: {
      variant: 'default',
      size: 'default'
    }
  }
)

export type ButtonVariants = VariantProps<typeof buttonVariants>
