<template>
  <main class="pt-40 small:pt-70">
    
    <Intro />
    
    <GithubContributionsGraph />

    <div class="container mt-40">
      <div class="prose">
        <h2 class="text-2xl relative">
          Some of my abilities
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
  &:before {
    content: '';
    position: absolute;
    top: 50%;
    right: calc(100% + 1rem);
    width: calc((100vw - 56rem) / 2);
    height: 1.25rem;
    background-color: var(--color-highlighter);
    transform: translateY(-50%);
  }
}
</style>
