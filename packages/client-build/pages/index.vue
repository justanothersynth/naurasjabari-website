<template>
  <div class="page p-4">

    <div class="fixed top-0 left-0 h-screen w-[calc((100vw-640px)/2)] col-1 p-4">
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
      <div class="py-4">
        <ProjectEntry1 />
      </div>
    </main>

    <div class="fixed top-0 right-0 h-screen w-[calc((100vw-640px)/2)] col-3 p-4">
      <SectionColumn2 />
      <div class="divider-vert bg-line left-0" />
    </div>
    
  </div>
</template>
