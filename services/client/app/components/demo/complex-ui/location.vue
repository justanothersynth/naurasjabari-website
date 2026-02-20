<template>

  <!-- CN Tower: Top row -->
  <HexAgon
    name="tile-4"
    attached-to="tile-1"
    :side="5"
    :margin="margin"
    size="90px">
    <div class="w-full h-full image bg-position-[-281px_-52px]" />
  </HexAgon>

  <HexAgon
    name="tile-3"
    attached-to="tile-1"
    :side="4"
    :margin="margin"
    size="90px">
    <div class="w-full h-full image bg-position-[-144px_-37px]" />
  </HexAgon>

  <!-- CN Tower: Middle row -->
  <HexAgon
    name="tile-2"
    attached-to="tile-1"
    :side="3"
    :margin="margin"
    size="90px">
    <div class="w-full h-full image bg-position-[-154px_-137px]" />
  </HexAgon>

  <HexAgon
    name="tile-1"
    attached-to="origin"
    :margin="margin"
    size="90px">
    <div class="w-full h-full image bg-position-[-236px_-130px]" />
  </HexAgon>

  <HexAgon
    name="tile-5"
    attached-to="tile-1"
    :side="0"
    :margin="margin"
    size="90px">
    <div class="w-full h-full image bg-position-[-334px_-137px]" />
  </HexAgon>

  <!-- CN Tower: Bottom row -->
  <HexAgon
    name="tile-6"
    attached-to="tile-1"
    :side="1"
    :margin="margin"
    size="90px">
    <div class="w-full h-full image bg-position-[-334px_-190px]" />
  </HexAgon>

  <HexAgon
    name="tile-7"
    attached-to="tile-1"
    :side="2"
    :margin="margin"
    size="90px">
    <div class="w-full h-full image bg-position-[-201px_-196px]" />
  </HexAgon>

  <!-- Extra -->
  <HexAgon
    name="tile-7"
    attached-to="tile-2"
    :side="4"
    :margin="margin"
    :is-clipped="false"
    size="90px">
    <div class="cover">
      <div class="absolute right-6 top-1/2 -translate-y-1/2 flex items-center gap-2 text-base whitespace-nowrap">
        In Toronto these days <Icon name="iconoir:map-pin" size="24" />
      </div>
    </div>
  </HexAgon>

</template>

<script setup lang="ts">
const margin = 4
</script>

<style lang="scss" scoped>
.image {
  position: absolute;
  bottom: 0;
  left: 0;
  background-image: url('/images/cntower-slanted.jpg');
  background-size: 450px;
  background-repeat: no-repeat;
}
</style>
