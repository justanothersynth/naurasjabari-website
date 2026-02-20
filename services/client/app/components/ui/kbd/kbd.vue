<template>
  <kbd :class="cn(kbdVariants({ variant, theme }), props.class)">
    <slot />
  </kbd>
</template>

<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import {  kbdVariants } from './variants'
import type {KbdVariants} from './variants'

interface Props {
  variant?: KbdVariants['variant']
  theme?: KbdVariants['theme']
  class?: HTMLAttributes['class']
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'default',
  theme: 'light',
  class: ''
})

const cn = useCn
</script>
