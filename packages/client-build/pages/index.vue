<template>
  <div class="page py-4">

    <div class="aside-1 fixed top-0 h-screen w-[400px] col-1 p-4">
      <SectionColumn1 />
      <div class="divider-vert bg-line right-0" />
    </div>

    <main class="mx-auto w-[640px] col-2 px-4">
      <div class="relative h-30">
        <p class="font-bold">
          RECENT WORKS
        </p>
        <div class="divider-horiz bg-line bottom-0" />
      </div>
      <div class="flex flex-col gap-12 py-4">
        <ProjectEntry1 />
      </div>
    </main>

    <div class="aside-2 fixed top-0 h-screen w-[400px] col-3 p-4">
      <SectionColumn2 />
      <div class="divider-vert bg-line left-0" />
    </div>
    
  </div>
</template>

<style lang="scss" scoped>
.page {
  padding-left: calc((100vw - 640px) / 2);
  padding-right: calc((100vw - 640px) / 2);
}

.aside-1 {
  right: calc(50% + (640px / 2));
}

.aside-2 {
  left: calc(50% + (640px / 2));
}
</style>
