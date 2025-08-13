<template>
  <div class="pt-40 pb-100">

    <HexMouseNodeIndicator />
    
    <div class="max-w-4xl mx-auto">

      <div class="flex bg-red-200 py-2 px-3 mb-20 rounded-lg text-left">
        <span>🚧</span>
        <p class="mx-2">
          This website is currently under construction and is being actively worked upon.
          Service interruptions or errors may occur.
          Fireworks may fly.
          Eyes may melt.
          Extreme feelings of being impressed may overwhelm you.
        </p>
        <span>🚧</span>
      </div>

      <Intro />

      <GithubContributionsGraph />

      <div class="divider flex items-center gap-4 mt-20 before:bg-gray-300 after:bg-gray-300">
        <Icon name="iconoir:arrow-down" size="12" />
        things I can do
        <Icon name="iconoir:arrow-down" size="12" />
      </div>

    </div>

    <DemoCronApiSupabase />

    <DemoComplexUiCanvas />

    <DemoScrapingDatabases />

  </div>
</template>

<style lang="scss" scoped>
.divider {
  &::before,
  &::after {
    content: '';
    flex: 1;
    height: 1px;
  }
}
</style>
