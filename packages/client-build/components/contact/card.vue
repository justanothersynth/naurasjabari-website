<template>
  <div :class="['flex items-center', size === 'mini' ? 'mt-2' : 'mt-6']">
    <div :class="labelClasses">
      <Icon name="iconoir:phone" size="16" class="mr-2" />
      phone
    </div>
    <a href="tel:2896891075" :class="linkClasses">
      289-689-1075
    </a>
  </div>

  <div :class="['flex items-center', size === 'mini' ? 'mt-2' : 'mt-6']">
    <div :class="labelClasses">
      <Icon name="iconoir:at-sign" size="16" class="mr-2" />
      email
    </div>
    <a href="mailto:build@naurasjabari.com" :class="linkClasses">
      build@naurasjabari.com
    </a>
  </div>

  <div
    v-if="size === 'mini'"
    :class="['flex items-center', size === 'mini' ? 'mt-2' : 'mt-6']"
    @click="$bus.$emit('open-contact-form')">
    <div :class="labelClasses">
      or
    </div>
    <UiButton variant="form">
      Fill out contact form
    </UiButton>
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  size?: 'mini' | 'default'
}>(), {
  size: 'default'
})

const { $bus } = useNuxtApp()

const labelClasses = 'label flex items-center font-semibold'
const linkClasses = 'text-blue-600 hover:underline ml-auto'
</script>

<style lang="scss" scoped>
.label {
  flex: 1;
  display: flex;
  flex-direction: row;
  align-items: center;
  &:after {
    content: '';
    flex: 1;
    min-width: 3rem;
    height: 0.25rem;
    margin: 0 0.25rem;
    background-image: radial-gradient(circle, currentcolor 1px, transparent 1px);
    background-size: 0.5rem 0.25rem;
    background-repeat: space no-repeat;
    opacity: 0.25;
  }
}
</style>
