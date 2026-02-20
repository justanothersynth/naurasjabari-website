<template>
  <div v-if="resultCount" class="result-explorer">

    There are currently {{ resultCount.toLocaleString() }} imported results

  </div>
</template>

<script>
// ===================================================================== Imports
import { mapGetters } from 'vuex'

// ====================================================================== Export
export default {
  name: 'ResultExplorer',

  computed: {
    ...mapGetters({
      resultCount: 'result/resultCount'
    })
  }
}
</script>
