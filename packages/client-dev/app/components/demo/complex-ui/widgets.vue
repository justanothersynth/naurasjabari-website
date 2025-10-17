<template>

  <HexAgon
    name="software"
    attached-to="origin"
    size="180px">
    <DemoComplexUiTileSoftware />
  </HexAgon>

  <HexAgon
    name="surf-dqt"
    attached-to="software"
    :side="3"
    size="180px">
    <DemoComplexUiTileSurfDqt />
  </HexAgon>

  <HexAgon
    name="developer-for"
    attached-to="software"
    :side="2"
    size="180px">
    <DemoComplexUiTileDeveloperFor />
  </HexAgon>

  <HexAgon
    name="intro"
    attached-to="surf-dqt"
    :side="2"
    :is-clipped="false"
    size="180px">
    <div class="cover">
      <div class="absolute right-6 top-1/2 -translate-y-1/2 flex items-center gap-2 text-base whitespace-nowrap text-center">
        🎉 Just some fun effects <br />
        and functionality
      </div>
    </div>
  </HexAgon>

</template>
