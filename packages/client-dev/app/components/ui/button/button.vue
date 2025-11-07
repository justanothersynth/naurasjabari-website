<template>
  <component
    :is="resolvedComponent"
    data-slot="button"
    :disabled="disabled || isLoading"
    :class="useCn(buttonVariants({ variant, size, disabled, selected }), props.class, 'button')"
    v-bind="componentProps"
    @click="emit('click', $event)">

    <div
      class="absolute inset-0 flex items-center justify-center transition-opacity duration-150"
      :class="{ 'opacity-100': isLoading, 'opacity-0': !isLoading }">
      <LoaderSpinner />
    </div>

    <div
      class="w-full h-full flex items-center justify-center transition-opacity duration-150"
      :class="{ 'opacity-0': isLoading, 'opacity-100': !isLoading }">
      <slot />
    </div>

  </component>
</template>

<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { Primitive } from 'reka-ui'
import type { PrimitiveProps } from 'reka-ui'
import { buttonVariants } from './variants'
import type { ButtonVariants } from './variants'

interface Props extends PrimitiveProps {
  variant?: ButtonVariants['variant']
  size?: ButtonVariants['size']
  class?: HTMLAttributes['class']
  to?: string
  disabled?: boolean
  selected?: boolean
  buttonId?: string
}

const props = withDefaults(defineProps<Props>(), {
  as: 'button',
  to: '',
  variant: 'default',
  size: 'default',
  class: '',
  disabled: false,
  selected: false,
  buttonId: ''
})

const emit = defineEmits<{
  click: [event: Event]
}>()

const { $bus } = useNuxtApp()
const isLoading = ref(false)

const resolvedComponent = computed(() => {
  if (props.as === 'nuxt-link') return resolveComponent('NuxtLink')
  return Primitive
})

const componentProps = computed(() => {
  if (props.as === 'nuxt-link') {
    // For NuxtLink, we pass through all attrs and exclude Primitive-specific props
    return props
  }
  // For Primitive, we pass the original props
  return {
    as: props.as,
    asChild: props.asChild
  }
})

const handleButtonLoadingState = (event: unknown) => {
  isLoading.value = (event as { isLoading: boolean }).isLoading
}

$bus.$on(props.buttonId, handleButtonLoadingState)

onBeforeUnmount(() => {
  if (props.buttonId !== '') {
    $bus.$off(props.buttonId, handleButtonLoadingState)
  }
})
</script>

<style lang="scss" scoped>
.button {
  transition: 150ms ease-out;
  &:hover {
    transition: 150ms ease-in;
  }
}
</style>
