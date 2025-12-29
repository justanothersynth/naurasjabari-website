<template>
  <main class="pt-40 small:pt-70">
    
    <Intro />
    
    <GithubContributionsGraph />

    <div class="container mt-40">
      <div class="prose">
        <h2 class="text-2xl relative">
          Works
        </h2>
      </div>
    </div>

    <Works />

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
  }
}
</style>
