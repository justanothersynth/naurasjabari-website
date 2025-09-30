<template>
  <aside>

    <div class="relative h-30">
      <p class="font-bold">
        CONTACT ME
      </p>
      <div class="divider-horiz bg-line bottom-0" />
    </div>

    <div class="mb-20 py-4">

      <p class="font-bold">
        REACH OUT
      </p>

      <p>
        I'm always happy to discuss a project idea or provide a quote.
      </p>

      <div class="flex items-center mt-6">
        <div class="label flex items-center font-semibold">
          <Icon name="iconoir:phone" size="16" class="mr-2" />
          phone
        </div>
        <a href="tel:2896891075" class="text-blue-600 hover:underline ml-auto">
          289-689-1075
        </a>
      </div>

      <div class="flex items-center mt-6">
        <div class="label flex items-center font-semibold">
          <Icon name="iconoir:at-sign" size="16" class="mr-1" />
          email
        </div>
        <a href="mailto:hello@naurasjabari.com" class="pl-6 text-blue-600 hover:underline">
          hello@naurasjabari.com
        </a>
      </div>

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
.label {
  flex: 1;
  display: flex;
  flex-direction: row;
  align-items: center;
  &:after {
    content: '';
    flex: 1;
    min-width: 3rem;
    height: 0.25rem;
    margin: 0 0.25rem;
    background-image: radial-gradient(circle, currentcolor 1px, transparent 1px);
    background-size: 0.5rem 0.25rem;
    background-repeat: space no-repeat;
    opacity: 0.25;
  }
}
</style>
