<template>
  <aside>

    <div class="header relative h-30">
      <p class="font-bold">
        CONTACT ME
      </p>
      <div class="divider-horiz bg-line bottom-0" />
    </div>

    <div class="mb-20 py-4">

      <p>
        I'm always happy to discuss a project idea or provide a quote.
      </p>

      <ContactCard />

      <div class="flex items-center my-6 mx-12">
        <div class="flex-1 h-px bg-line" />
        <span class="px-4 text-sm text-gray-500">or</span>
        <div class="flex-1 h-px bg-line" />
      </div>

      <ContactForm />

    </div>
    
  </aside>
</template>

<style lang="scss" scoped>
.header {
  @include customMaxMQ(1233px) {
    display: none;
  }
}
</style>
