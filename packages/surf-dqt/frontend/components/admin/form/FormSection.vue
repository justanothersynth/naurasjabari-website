<template>
  <section :class="['section', { group: isGroup }]">

    <div
      v-if="label"
      class="section-label">
      {{ label }}
    </div>

    <template v-if="type === 'group'">
      <div class="group-container">
        <FormSection
          v-for="(formSection, sectionIndex) in fields"
          :key="sectionIndex"
          :section="formSection"
          :namespace="namespace"
          v-on="$listeners" />
      </div>
    </template>

    <FieldContainer
      v-else
      :field="section"
      :namespace="namespace"
      v-on="$listeners" />

  </section>
</template>

<script>
// ===================================================================== Imports
import FormSection from '@/components/admin/form/FormSection'
import FieldContainer from '@/components/admin/form/FieldContainer'

// ====================================================================== Export
export default {
  name: 'FormSection',

  components: {
    FormSection,
    FieldContainer
  },

  props: {
    section: {
      type: Object,
      required: true
    },
    namespace: {
      type: String,
      required: true
    }
  },

  computed: {
    type () {
      return this.section.type
    },
    isGroup () {
      return this.type === 'group'
    },
    fields () {
      return this.section.fields
    },
    label () {
      const section = this.section
      return section.type === 'group' ? section.label : false
    }
  }
}
</script>

<style lang="scss" scoped>
// ///////////////////////////////////////////////////////////////////// General
.form-builder {
  > .section {
    padding-top: 2rem;
    max-width: 50rem;
    > .section-label {
      padding-left: 2rem;
    }
    > .group-container {
      position: relative;
      border: 1px solid $whisper;
      border-left: 0;
      &:before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 4px;
        height: 100%;
        background-color: $electricViolet;
      }
      .group-container {
        border: 1px solid gray;
      }
    }
  }
}

.section {
  .section {
    padding: 2rem;
  }
}

.section-label {
  position: relative;
  font-size: 1.25rem;
  font-weight: 500;
  line-height: 1;
  margin-bottom: 2rem;
}
</style>
