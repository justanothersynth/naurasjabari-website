<template>
  <div ref="cardRef" class="work-entry block group">
    
    <div class="overflow-hidden rounded-lg transition-all duration-300 group-hover:shadow-lg border border-gray-200/50 group-hover:border-gray-200">
      <ImageLazy
        :src="image"
        :alt="title"
        :width="1200"
        :height="630"
        image-class="w-full h-full object-cover"
        container-class="block aspect-[1200/630]" />
    </div>

    <div class="prose mt-4 px-2">
      <h3 class="flex items-center gap-2 mb-2 font-medium text-[18.3px]">
        <span class="relative flex items-center">
          <span
            class="w-3 h-3 rounded-full animate-ping [animation-duration:1.5s] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
            :class="statusColour" />
          <span class="w-2.5 h-2.5 rounded-full" :class="statusColour" />
        </span>
        <a
          :href="link"
          target="_blank"
          class="relative no-underline group-hover:underline inline-link">
          {{ title }}
          <span class="block absolute left-full top-1/2 -translate-y-1/2 pl-1">
            <Icon name="iconoir:arrow-up-right-square" size="16" class="opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
          </span>
        </a>
      </h3>
      <div class="flex items-center gap-2">
        <template v-for="tag in tags" :key="typeof tag === 'string' ? tag : tag.label">
          <a
            v-if="typeof tag === 'object' && tag.url"
            :href="tag.url"
            target="_blank"
            rel="noopener noreferrer"
            :class="cn('flex whitespace-nowrap items-center text-xs px-2 py-0.125 rounded-[6px] transition-colors duration-200 bg-blue-100 text-blue-700 hover:bg-blue-200 hover:text-blue-800', tag.extraClasses)">
            {{ tag.label }}
            <Icon name="iconoir:arrow-up-right-square" size="12" class="ml-[2px]" />
          </a>
          <span
            v-else
            class="text-xs whitespace-nowrap px-2 py-0.125 rounded-[6px] bg-gray-200/50 text-gray-700">
            {{ tag }}
          </span>
        </template>
      </div>
      <p>{{ description }}</p>
    </div>

  </div>
</template>

<script setup lang="ts">
type Tag = string | {
  label: string
  url?: string
  extraClasses?: string
}

type Props = {
  title: string
  description: string
  image: string
  link?: string
  status: 'live' | 'archived'
  tags?: Tag[]
}

const props = defineProps<Props>()

const cn = useCn

const statusColour = computed(() => {
  return props.status === 'live' ? 'bg-[#40c463]/75' : 'bg-orange-400'
})
</script>
