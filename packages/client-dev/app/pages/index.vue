<template>
  <main class="pt-40 small:pt-70">
    
    <Intro />
    
    <GithubContributionsGraph />

    <div class="container mt-40">
      <div class="prose">

        <h2 class="text-2xl relative mb-0">
          Works
        </h2>

        <div class="flex items-center gap-2 mb-2 font-medium mt-1 gap-x-5">
          <span
            v-for="status in statuses"
            :key="status.text"
            class="relative flex items-center gap-2">
            <span class="relative flex items-center">
              <span
                class="w-3 h-3 rounded-full animate-ping [animation-duration:1.5s] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                :class="status.color" />
              <span class="w-2.5 h-2.5 rounded-full" :class="status.color" />
            </span>
            {{ status.text }}
          </span>
        </div>

      </div>
    </div>

    <section class="container mt-20">
      <Works />
    </section>

    <div class="container mt-40">
      <div class="prose">
        <h2 class="text-2xl relative">
          Showcase
        </h2>
      </div>
    </div>

    <DemoCronApiSupabase />

    <DemoComplexUi />

    <DemoWebScraping />

    <Divider class="container">
      ⬇️
    </Divider>

    <Footer />

  </main>
</template>

<script setup lang="ts">
const statuses = [
  { text: 'Live', color: 'bg-[#40c463]/75' },
  { text: 'Hosted archive', color: 'bg-orange-400' },
  { text: 'Offline archive', color: 'bg-gray-400' }
]
</script>

<style lang="scss" scoped>
h2 {
  display: inline-block;
  &:before {
    content: '';
    position: absolute;
    top: 50%;
    right: calc(100% + 1rem);
    width: calc((100vw - 56rem) / 2 - 2rem);
    height: 1.25rem;
    background-color: oklch(92.8% 0.006 264.531 / 0.75);
    border-radius: 6px;
    transform: translateY(-50%);
    @include medium {
      right: auto;
      left: calc(100% + 1rem);
      width: 100vw;
    }
  }
}
</style>
