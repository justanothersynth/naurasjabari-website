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
        I really enjoy the process of designing and building things that are useful and that will bring joy to those that use them.
      </p>
      <p>
        Whether it's a coffee table, a pergola, a new stone walkway or a complete bathroom rebuild, I'm here to make it happen. Carpentry is my first true love, but I've always enjoyed being multi-faceted in my knowledge and abilities. I'm currently building up my portfolio and working on increasing my skillset, so I am offering my services at a significant discount. Regardless, your project will be completed with care and attention to detail.
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
