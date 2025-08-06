<template>
  <HexCanvas class="mt-20">

    <HexNode
      name="intro"
      attached-to="origin"
      :radius="600">
      <HexAgon
        name="intro"
        attached-to="origin"
        size="300px"
        :is-clipped="false">
        <div class="cover text-base flex flex-col justify-center">
          <div class="text-lg mb-4">
            Complex UIs
          </div>
          Building truly complex UIs is difficult and time-consuming, but can very rewarding. Both in the personal feeling of accomplishment as well as for the eye-candy factor. Sometimes it's nice to just stare at something interesting!
        </div>
      </HexAgon>
    </HexNode>

    <HexNode
      name="where-am-i"
      attached-to="intro"
      :angle="55">
      <DemoComplexUiLocation />
    </HexNode>

    <HexNode
      name="widgets"
      attached-to="intro"
      :angle="-55">
      <DemoComplexUiWidgets />
    </HexNode>

  </HexCanvas>
</template>
