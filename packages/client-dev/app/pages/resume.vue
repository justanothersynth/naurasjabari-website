<template>
  <main class="pt-40 small:pt-70">

    <!-- Toolbar -->
    <div class="container">
      <div class="toolbar flex justify-center items-center gap-6 p-4 mb-2">
        
        <UiButton
          download
          variant="default"
          size="medium"
          aria-label="Download Resume as PDF"
          @click="downloadResume('naurasjabari-resume.pdf')">
          <Icon name="iconoir:download" size="16" class="mr-2" />
          <span class="whitespace-nowrap">download PDF</span>
        </UiButton>

        <UiButton
          variant="default"
          size="medium"
          aria-label="Download Print-Friendly Version"
          @click="downloadResume('naurasjabari-resume-bw.pdf')">
          <Icon name="iconoir:printing-page" size="16" class="mr-2" />
          <span class="whitespace-nowrap">print-friendly PDF</span>
        </UiButton>

      </div>
    </div>

    <!-- Resume -->
    <div class="container resume aspect-210/297 bg-root border border-gray-200 rounded-lg overflow-hidden shadow-xl">
      <ImageLazy
        src="/resume/naurasjabari-resume.jpg"
        alt="Nauras Jabari Resume"
        display-loading-text
        class="w-full h-full object-cover" />
    </div>

    <!-- Footer -->
    <Divider class="container">
      ⬇️
    </Divider>

    <Footer />

  </main>
</template>

<script lang="ts" setup>
/**
 * Downloads a resume PDF file.
 * The server endpoint sets Content-Disposition: attachment to force download
 * instead of opening in a new tab. This approach streams the file directly
 * from server to disk without loading it into browser memory.
 *
 * @param filename - The name of the PDF file to download (e.g., 'naurasjabari-resume.pdf')
 */
const downloadResume = (filename: string) => {
  const link = document.createElement('a')
  link.href = `/api/resume/download?filename=${encodeURIComponent(filename)}`
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
</script>

<style lang="scss" scoped>
.resume {
  box-shadow: 0 6px 24px 0 rgb(163 163 163 / 11%);
}
</style>
