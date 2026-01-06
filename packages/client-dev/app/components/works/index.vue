<template>
  <section class="container mt-12">
    <div class="grid grid-cols-1 mini:grid-cols-2 small:grid-cols-3 gap-12 mini:gap-6">

      <WorksEntry
        v-for="work in works"
        :key="work.id"
        :title="work.title"
        :description="work.description"
        :image="work.image"
        :link="work.link"
        :status="work.status"
        :tags="work.tags" />

    </div>
  </section>
</template>

<script setup lang="ts">
type Tag = string | {
  label: string
  url?: string
  extraClasses?: string
}

type Work = {
  id: string
  title: string
  description: string
  image: string
  link?: string
  status: 'live' | 'archived'
  tags?: Tag[]
}

const works: Work[] = [
  {
    id: 'amera',
    title: 'Amera Health Solutions',
    description: 'AI-powered document parsing, information processing and analysis. YCombinator Fall 2025 ⭐️',
    image: '/images/works/amera.jpg',
    link: 'https://www.amerahealthsolutions.com/',
    status: 'live',
    tags: [
      {
        label: 'YC Fall 2025',
        url: 'https://www.ycombinator.com/companies/amera',
        extraClasses: 'bg-orange-100 text-orange-700'
      },
      'AI',
      'supabase',
      'full stack'
    ]
  },
  {
    id: 'labur',
    title: 'Labur',
    description: 'Seamless integration of Angular application into a bespoke Wordpress website build',
    image: '/images/works/labur.jpg',
    link: 'https://labur.com',
    status: 'live',
    tags: ['wordpress', 'angular', 'devops']
  },
  {
    id: 'ipts',
    title: 'Interplanetary Talent Services',
    description: 'Combination of static site development and complex UI implementation',
    image: '/images/works/ipts.jpg',
    link: 'https://ipts.ai',
    status: 'live',
    tags: ['nuxt/vue', 'static site', 'complex ui', 'devops']
  }
]
</script>
