<template>
  <div class="pt-40 pb-100">

    <HexMouseNodeIndicator />
    
    <div class="max-w-4xl mx-auto">

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
