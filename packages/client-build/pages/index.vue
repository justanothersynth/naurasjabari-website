<template>
  <div
    ref="pageRef"
    class="page"
    :class="{ 'loadded': pageMounted }"
    :style="{ height: pageHeightStyle }">

    <nav class="menu fixed bottom-4 left-1/2 -translate-x-1/2 z-100 bg-prime border-line border-1 p-2 h-11 rounded-full gap-2 shadow-xl">
      <UiButton
        v-for="button in menuButtons"
        :key="button.value"
        variant="menu"
        :selected="activePanel === button.value"
        @click="navigateToPanel(button.value)">
        {{ button.label }}
      </UiButton>
    </nav>

    <div ref="trackRef" class="track" :style="{ transform: trackTransformStyle }">

      <!-- ====================================================== Left aside -->
      <div ref="aboutPanelRef" class="aside-1 fixed top-0 h-screen p-4">
        <SectionColumn1 />
        <div class="divider-vert bg-line right-0" />
      </div>

      <!-- ==================================================== Main content -->
      <main ref="worksPanelRef" class="main w-[640px] pt-4 px-4">
        
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
          <ProjectEntry1 />
        </div>
        
      </main>

      <!-- ===================================================== Right aside -->
      <div ref="contactPanelRef" class="aside-2 fixed top-0 h-screen">
        <div class="h-full p-4 overflow-y-scroll">
          <SectionColumn2 />
        </div>
        <div class="divider-vert bg-line left-0" />
      </div>

    </div>
    
  </div>
</template>

<script setup lang="ts">
const activePanel = ref<'about' | 'works' | 'contact'>('works')
const trackTransform = ref(-100)
const pageHeight = ref(0)
const windowWidth = ref(0)
const pageMounted = ref(false)

const menuButtons = [
  { label: 'About', value: 'about' },
  { label: 'Works', value: 'works' },
  { label: 'Contact', value: 'contact' }
] as const

const pageRef = ref<HTMLDivElement>()
const trackRef = ref<HTMLDivElement>()
const aboutPanelRef = ref<HTMLDivElement>()
const worksPanelRef = ref<HTMLElement>()
const contactPanelRef = ref<HTMLDivElement>()

const trackTransformStyle = computed(() => {
  if (windowWidth.value <= 850) {
    return `translateX(${trackTransform.value}vw)`
  }
  return 'none'
})

const pageHeightStyle = computed(() => {
  if (windowWidth.value <= 850) {
    return `${pageHeight.value}px`
  }
  return 'auto'
})

const updateWindowWidth = () => {
  windowWidth.value = window.innerWidth
}

const updatePageHeight = () => {
  let panelHeight = 0
  
  if (activePanel.value === 'about') {
    panelHeight = aboutPanelRef.value?.scrollHeight || 0
  } else if (activePanel.value === 'works') {
    panelHeight = worksPanelRef.value?.scrollHeight || 0
  } else if (activePanel.value === 'contact') {
    panelHeight = contactPanelRef.value?.scrollHeight || 0
  }
  
  pageHeight.value = panelHeight
}

const handleResize = () => {
  const previousWidth = windowWidth.value
  updateWindowWidth()
  // Switch to Works panel when crossing into mobile view
  if (previousWidth > 850 && windowWidth.value <= 850) {
    navigateToPanel('works')
  }
  updatePageHeight()
}

const navigateToPanel = (panel: 'about' | 'works' | 'contact') => {
  activePanel.value = panel
  
  if (panel === 'about') {
    trackTransform.value = 0
  } else if (panel === 'works') {
    trackTransform.value = -100
  } else if (panel === 'contact') {
    trackTransform.value = -200
  }
  
  updatePageHeight()
}

onMounted(() => {
  // Set initial window width and height
  updateWindowWidth()
  updatePageHeight()
  // Add resize listener
  window.addEventListener('resize', handleResize)
  // Enable transition after 200ms
  setTimeout(() => {
    pageMounted.value = true
  }, 200)
})

onUnmounted(() => {
  // Clean up resize listener
  window.removeEventListener('resize', handleResize)
})
</script>

<style lang="scss" scoped>
.page {
  padding-left: calc((100vw - 640px) / 2);
  padding-right: calc((100vw - 640px) / 2);
  overflow: hidden;
  &.loadded {
    transition: height 150ms cubic-bezier(0.4, 0, 0.2, 1);
  }
  @include customMaxMQ(1233px) {
    display: flex;
    padding-left: 0;
    padding-right: 0;
    width: 100%;
  }
  @include customMaxMQ(1233px) {
    padding-left: 400px;
    padding-right: 0;
  }
  @include medium {
    padding-left: 300px;
  }
  @include small {
    padding-left: 0;
    padding-top: 0;
  }
}

.menu {
  display: none;
  @include small {
    display: flex;
  }
}

.track {
  display: flex;
  @include small {
    width: 300vw;
    transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  }
}

.main {
  @include customMaxMQ(1233px) {
    width: auto;
  }
  @include small {
    width: 100vw;
    padding-top: calc(var(--spacing) * 4);
  }
}

.projects {
  @include small {
    padding-bottom: calc(var(--spacing) * 19);
  }
}

.aside-1,
.aside-2 {
  width: 400px;
  @include gridMinMQ {
    width: calc((100% - 640px) / 2);
  }
  @include small {
    position: relative;
    padding-bottom: calc(var(--spacing) * 19);
  }
}

.aside-1 {
  right: calc(50% + (640px / 2));
  @include customMaxMQ(1233px) {
    width: 400px;
    right: auto;
    left: 0;
  }
  @include medium {
    width: 300px;
  }
  @include small {
    width: 100vw;
  }
}

.aside-2 {
  left: calc(50% + (640px / 2));
  @include customMaxMQ(1233px) {
    display: none;
  }
  @include small {
    display: block;
    width: 100vw;
    left: auto;
  }
}

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
