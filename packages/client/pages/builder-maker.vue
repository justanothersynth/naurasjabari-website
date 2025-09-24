<template>
  <main class="pt-40 pb-20 font-proxima">

    <div class="max-w-4xl mx-auto">

      <ContractorIntro />

      <div class="flex justify-center bg-gray-100 py-2 px-3 mt-8 rounded-sm text-left">
        <span>🚧</span>
        <p class="mx-2">
          This website is currently under construction and is being actively worked upon.
        </p>
        <span>🚧</span>
      </div>

      <Divider>
        <Icon name="iconoir:arrow-down" size="12" />
        <span class="font-medium">some things I've built</span>
        <Icon name="iconoir:arrow-down" size="12" />
      </Divider>

    </div>
    
    <div class="max-w-6xl mx-auto mt-20">
      <ContractorProjects />
    </div>

    <div class="max-w-4xl mx-auto">
      <Divider>
         📣
        <span class="font-medium">get in touch</span>
         📣
      </Divider>
      <ContractorFooter />
    </div>
    
  </main>
</template>
