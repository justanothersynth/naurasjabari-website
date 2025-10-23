<template>
  <div class="headers relative flex h-30">

    <div class="header-works flex-1">
      <p class="flex flex-col font-bold">
        RECENT WORKS
        <Icon name="iconoir:arrow-down" size="16" class="icon mt-2" />
      </p>
      <div class="divider-horiz bg-line bottom-0" />
    </div>

    <div class="header-contact flex-1 relative pl-4">
      <p class="font-bold">
        CONTACT ME
      </p>
      <ContactCard size="mini" />
      <ContactForm :floating="true" />
      <div class="divider-vert bg-line left-0 top-0 h-full" />
    </div>

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
.headers {
  @include customMaxMQ(1233px) {
    height: calc(var(--spacing) * 34);
  }
}

.header-works {
  .icon {
    display: none;
    @include customMaxMQ(1233px) {
      display: block;
    }
  }
}

.header-contact {
  display: none;
  @include customMaxMQ(1233px) {
    display: block;
  }
  @include small {
    display: none;
  }
}
</style>
