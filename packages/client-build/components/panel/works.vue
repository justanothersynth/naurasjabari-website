<template>
  <div class="header relative h-30">
    <p class="flex flex-col font-bold">
      RECENT WORKS
      <Icon name="iconoir:arrow-down" size="16" class="icon mt-2" />
    </p>
    <div class="divider-horiz bg-line bottom-0" />
  </div>

  <div class="projects flex flex-col gap-12 py-4">
    <ProjectTemplate
      v-for="project in projects"
      :key="project.title"
      v-bind="project" />
  </div>
</template>

<script setup lang="ts">
import YakisugiCedarStep from '@/content/yakisugi-cedar-step.json'

const projects = [
  YakisugiCedarStep
]
</script>

<style lang="scss" scoped>
.header {
  @include customMaxMQ(1233px) {
    height: calc(var(--spacing) * 34);
  }
}
</style>
