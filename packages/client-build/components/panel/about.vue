<template>
  <aside class="flex flex-col h-full w-full">

    <div class="header relative h-30">
      <p class="font-bold">
        NAURAS JABARI
      </p>
      <p>Carpenter at heart.<br />General contractor everywhere else.</p>
      <div class="divider-horiz bg-line bottom-0" />
    </div>

    <div class="mt-auto">
      <NuxtImg
        preload
        format="webp"
        src="/images/profile-img.png"
        alt="Nauras Jabari"
        class="aspect-square w-25 mb-6" />
      <p>
        I genuinely enjoy the process of designing and building and strive leave my clients feeling a sense of satisfaction and connection with the things I create.
      </p>
      <p>
        Carpentry is my first true love, but I've always enjoyed being multi-faceted in my knowledge and abilities. I take my time and place great care in your project, opting for quality and attention to detail.
      </p>
    </div>
    
  </aside>
</template>

<style lang="scss" scoped>
.header {
  @include customMaxMQ(1233px) {
    height: calc(var(--spacing) * 34);
  }
}
</style>
