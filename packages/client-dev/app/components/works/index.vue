<template>
  <section class="container mt-12">
    <div class="grid grid-cols-1 medium:grid-cols-2 large:grid-cols-3 gap-8">

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
type Work = {
  id: string
  title: string
  description: string
  image: string
  link?: string
  status: 'live' | 'archived'
  tags?: string[]
}

const works: Work[] = [
  {
    id: 'labur',
    title: 'Labur',
    description: 'Highly custom-built Wordpress website that contains an integrated Angular application',
    image: '/images/works/labur.jpg',
    link: 'https://labur.com',
    status: 'live',
    tags: ['wordpress', 'angular', 'devops']
  }
]
</script>
