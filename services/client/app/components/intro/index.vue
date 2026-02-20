<template>
  <section class="flex flex-col gap-8 small:flex-row small:gap-12 container">

    <div class="prose max-w-[50ch] small:max-w-none small:flex-2">
      <h1 class="text-xl small:text-2xl flex items-center gap-3">
        Hi 👋 I'm Nauras
        <IntroTiltImage
          src="/images/nauras-profile.jpg"
          alt="Profile picture of Nauras"
          class="w-12 tiny:w-14 aspect-square object-cover rounded-2xl shadow-md small:hidden mt-0 mb-0" />
      </h1>
      <p class="text-lg small:text-lg">
        A full-stack software engineer with 10+ years of experience. My specialty lies in prototype development, AI engineering, complex UI implementation and systems integration inside the javascript ecosystem.
      </p>
      <p class="small:text-base">
        Most of my time has been spent as Lead Engineer in team-based settings, with substantial involvement in project and account management.
        I've handled code integrations across multiple teams worldwide, established processes and structures to keep operations running smoothly, and helped many junior engineers advance to intermediate roles.
      </p>
      <p class="small:text-base">
        ⭐ Experienced in the integration of AI services (OpenAI, Anthropic, Mistral, etc.), prompt design, LLM routing, structured outputs and API orchestration.
      </p>
    </div>

    <div class="hidden small:flex items-start justify-end flex-1">
      <client-only>
        <IntroTiltImage
          src="/images/nauras-profile.jpg"
          alt="Profile picture of Nauras"
          class="w-80 aspect-square object-cover rounded-4xl shadow-2xl" />
      </client-only>
    </div>

  </section>
</template>
