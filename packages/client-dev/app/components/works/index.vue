<template>
  <div class="grid grid-cols-1 mini:grid-cols-2 small:grid-cols-3 gap-12 mini:gap-x-6 mini:gap-y-12">

    <WorksEntry
      v-for="work in works"
      :key="work.id"
      v-bind="work" />

  </div>
</template>

<script setup lang="ts">
import type { WorkEntry } from '@/types/works'

const works: WorkEntry[] = [
  {
    id: 'amera',
    title: 'Amera Health Solutions',
    description: 'AI-powered document parsing, information processing and analysis. ⭐️ YCombinator Fall 2025.',
    image: '/images/works/amera.jpg',
    link: 'https://www.amerahealthsolutions.com/',
    status: 'live',
    tags: [
      {
        label: 'YC Fall 2025',
        url: 'https://www.ycombinator.com/companies/amera'
      },
      'AI',
      'supabase',
      'full stack'
    ],
    attribution: 'agencyundone'
  },
  {
    id: 'labur',
    title: 'Labur',
    description: 'Seamless integration of Angular application into a bespoke Wordpress website build',
    image: '/images/works/labur.jpg',
    link: 'https://labur.com',
    status: 'live',
    tags: ['wordpress', 'angular', 'devops'],
    attribution: 'agencyundone'
  },
  {
    id: 'ipts',
    title: 'Interplanetary Talent Services',
    description: 'Combination of static site development and complex UI implementation',
    image: '/images/works/ipts.jpg',
    link: 'https://ipts.ai',
    status: 'live',
    tags: ['nuxt/vue', 'static site', 'complex ui', 'devops'],
    attribution: 'agencyundone'
  },
  {
    id: 'tucows',
    title: 'Mailchimp Importer Tool',
    description: 'Custom importer tool, parsing CSV contact lists and importing them into Mailchimp',
    image: '/images/works/tucows.jpg',
    link: 'https://github.com/justanothersynth?tab=repositories&q=tucows',
    status: 'offline',
    tags: ['vue', 'express', 'api interfacing'],
    attribution: 'tucows'
  },
  {
    id: 'surf-dqt',
    title: 'SURF Data Query Tool',
    description: 'Nuxt and Express dockerized pairing for visualization of suicide research. ⭐️ Published work.',
    image: '/images/works/surf-dqt.jpg',
    link: 'https://works.naurasjabari.com/surf-dqt',
    status: 'archived',
    tags: [
      {
        label: 'Publication',
        url: 'https://pubmed.ncbi.nlm.nih.gov/39647866/'
      },
      'nuxt/vue', 'express', 'mongodb'
    ],
    attribution: 'agencyundone'
  }
]
</script>
