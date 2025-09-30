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
        <p v-for="n in 20" :key="n">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque euismod, nisi eu consectetur consectetur, nisl nisi consectetur nisi, euismod euismod nisi nisi euismod. Sed euismod, nisl euismod euismod, nisi nisi euismod nisi, euismod euismod nisi nisi euismod. Mauris euismod, nisi euismod euismod, nisi nisi euismod nisi, euismod euismod nisi nisi euismod. Suspendisse potenti. Proin euismod, nisi euismod euismod, nisi nisi euismod nisi, euismod euismod nisi nisi euismod. Etiam euismod, nisi euismod euismod, nisi nisi euismod nisi, euismod euismod nisi nisi euismod. Nullam euismod, nisi euismod euismod, nisi nisi euismod nisi, euismod euismod nisi nisi euismod.
        </p>
      </div>
    </main>

    <div class="fixed top-0 right-0 h-screen w-[calc((100vw-640px)/2)] col-3 p-4">
      <SectionColumn2 />
      <div class="divider-vert bg-line left-0" />
    </div>
    
  </div>
</template>
