<template>
  <component
    :is="componentType"
    ref="cardRef"
    :href="link"
    :target="link ? '_blank' : undefined"
    :rel="link ? 'noopener noreferrer' : undefined"
    class="work-entry block group cursor-pointer">
    
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
            :class="statusColour">
          </span>
          <span
            class="w-2.5 h-2.5 rounded-full"
            :class="statusColour">
          </span>
        </span>
        <span>{{ title }}</span>
      </h3>
      <div class="flex items-center gap-2">
        <template v-for="tag in tags" :key="typeof tag === 'string' ? tag : tag.label">
          <a
            v-if="typeof tag === 'object' && tag.url"
            :href="tag.url"
            target="_blank"
            rel="noopener noreferrer"
            :class="cn('flex whitespace-nowrap items-center text-xs px-2 py-0.125 rounded-[6px] transition-colors duration-200 bg-gray-200/50 text-gray-700 hover:bg-orange-200 hover:text-orange-800', tag.extraClasses)">
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

  </component>
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
const componentType = computed(() => props.link ? 'a' : 'div')

const statusColour = computed(() => {
  return props.status === 'live' ? 'bg-[#40c463]/75' : 'bg-orange-400'
})
</script>
