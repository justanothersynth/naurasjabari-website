<template>
  <div class="toolbar">

    <div class="panel-left">
      <slot name="panel-left" />
    </div>

    <div class="panel-right">
      <slot name="panel-right" />
    </div>

  </div>
</template>

<script>
// ====================================================================== Export
export default {
  name: 'FormToolbar'
}
</script>

<style lang="scss" scoped>
// ///////////////////////////////////////////////////////////////////// General
.toolbar {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: flex-end;
}

.panel-left {
  display: flex;
  flex-direction: column;
}

.panel-right {
  display: flex;
  flex-direction: row;
  align-items: center;
}
</style>
