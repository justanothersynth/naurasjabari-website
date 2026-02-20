<template>
  <footer class="footer relative max-w-4xl mx-auto mt-20 grid grid-cols-2 gap-4">
    
    <section>
      <p class="font-semibold mb-6">
        Contact me to discuss a quote or project idea
      </p>
      <ContactForm />
    </section>

    <section class="flex flex-col items-center">
      <p class="flex items-center font-semibold mb-2">
        <Icon name="iconoir:phone" size="16" class="mr-2" />
        Phone number
      </p>
      <a href="tel:2896891075" class="pl-6 text-blue-600 hover:underline">
        289-689-1075
      </a>
      <p class="flex items-center font-semibold mt-6 mb-2">
        <Icon name="iconoir:at-sign" size="16" class="mr-1" />
        Email
      </p>
      <a href="mailto:hello@naurasjabari.com" class="pl-6 text-blue-600 hover:underline">
        hello@naurasjabari.com
      </a>
    </section>
    
  </footer>
</template>
