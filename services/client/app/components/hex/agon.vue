<!--
  Sources:
    - Hexagon with rounded corners clip-path: https://www.plantcss.com/css-clip-path-converter
-->

<template>
  <div
    ref="hexagonRef"
    :class="['hex', {
      'show-blueprint': showBlueprint,
      'show-outline': showOutline,
      visible,
      selected: hexagon?.selected,
      'not-clipped': !isClipped
    }]"
    :style="{
      '--size': size,
      top: `calc(50% - ${size} * 1.15470053838 / 2)`,
      left: `calc(50% - ${size} / 2)`,
      transform: `translate(${position.x}px, ${position.y}px)`
    }"
    @mouseenter="handleMouseEnterLeave(true)"
    @mouseleave="handleMouseEnterLeave(false)">

    <div class="hex-content">
      <slot />
    </div>

    <HexBlueprint
      v-if="showBlueprint"
      :hex-name="props.name" />

    <svg
      v-if="showOutline"
      viewBox="0 0 174 197"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      class="absolute inset-0 w-full h-full object-cover">
      <path
        d="M81.1025 2.47366C84.5059 0.508717 88.6991 0.508718 92.1025 2.47366L166.705 45.5459C170.108 47.5108 172.205 51.1416 172.205 55.0713V141.216C172.205 145.146 170.108 148.776 166.705 150.741L92.1025 193.814C88.6991 195.778 84.5059 195.778 81.1025 193.814L6.5 150.741C3.09683 148.776 1.00017 145.146 1 141.216V55.0713C1.00017 51.1416 3.09683 47.5108 6.5 45.5459L81.1025 2.47366Z"
        stroke="#D9D9D9"
        stroke-width="3" />
    </svg>

  </div>
</template>

<script setup lang="ts">
import type { Hexagon } from '@/types/hexagon'

const props = withDefaults(defineProps<{
  name: string
  url?: string
  side?: number
  attachedTo?: string
  size?: string
  showBlueprint?: boolean
  showOutline?: boolean
  margin?: number
  shift?: 'none' | 'right' | 'left',
  isClipped?: boolean
}>(), {
  url: '',
  side: 0,
  attachedTo: 'origin',
  size: '150px',
  showBlueprint: undefined,
  showOutline: undefined,
  margin: 8,
  shift: 'none',
  isClipped: true
})

// Inject showBlueprint from HexCanvas as fallback when prop is not explicitly set
const injectedShowBlueprint = inject<Ref<boolean>>('hexCanvasShowBlueprint', ref(false))
const showBlueprint = computed(() => props.showBlueprint ?? injectedShowBlueprint.value)

// Inject showOutline from HexCanvas as fallback when prop is not explicitly set
const injectedShowOutline = inject<Ref<boolean>>('hexCanvasShowOutline', ref(false))
const showOutline = computed(() => props.showOutline ?? injectedShowOutline.value)

// Provide the hexagon name to all child components
provide('hexName', props.name)
provide('hexUrl', props.url)

const { $bus } = useNuxtApp()

const store = useHexagonStore()
const { hexagons } = storeToRefs(store)
const hexagonRef = ref<HTMLElement | null>(null)
const position = ref({
  x: 0,
  y: 0
})
const visible = ref(false)

const belongsToHexNode = inject<string>('belongsToHexNode', '')

const hexagon = computed(() => store.getHexagon(props.name) as Hexagon)

/**
 * Calculate the offset needed to position a hexagon relative to another hexagon's edge
 * @param size1 - The width of the parent hexagon
 * @param size2 - The width of the child hexagon
 * @returns Object with x and y offset values
 */
const getHexEdgeOffset = (size1: number, size2: number): { x: number; y: number } => {
  const directionInDegrees = props.side * 60
  const angle = directionInDegrees * (Math.PI / 180)
  const theta = (directionInDegrees + 360) % 360

  const SQRT3 = Math.sqrt(3)
  const TO_FLAT = 0.5
  const TO_CORNER = SQRT3 / 2

  const flatSideAngles = [0, 60, 120, 180, 240, 300]
  const isFlatSideDirection = flatSideAngles.some(a => Math.abs(theta - a) < 1)

  const r1 = isFlatSideDirection ? size1 * TO_FLAT : size1 * TO_CORNER
  const r2 = isFlatSideDirection ? size2 * TO_FLAT : size2 * TO_CORNER

  // Distance from center to center along the connecting direction
  const baseDistance = r1 + r2 + props.margin
  const baseX = baseDistance * Math.cos(angle)
  const baseY = baseDistance * Math.sin(angle)

  // Adjustment along the edge to align vertex
  let slideX = 0
  let slideY = 0

  if (isFlatSideDirection && props.shift !== 'none') {
    // We want to shift along the edge (i.e. perpendicular to the direction)
    const edgeSlideDirection = angle - Math.PI / 2 // counterclockwise or "right" is "up" the edge
    const shiftAmount = Math.abs(size2 - size1) / 3.5 // distance from center to vertex

    const signedShift = props.shift === 'left' ? -shiftAmount : shiftAmount

    slideX = signedShift * Math.cos(edgeSlideDirection)
    slideY = signedShift * Math.sin(edgeSlideDirection)
  }

  return {
    x: baseX + slideX,
    y: baseY + slideY
  }
}

/**
 * When the hexagon positioning animation ends, store its coordinate and
 * positioning data and notify any dependent hexagons to position themselves
 * @param event - The transition event
 */
const handleTransitionEnd = (event: TransitionEvent) => {
  // Only handle transitions from the hexagon element itself, not child elements
  if (event.target !== hexagonRef.value) return
  if (event.propertyName === 'opacity') {
    const data: Hexagon = {
      ref: hexagonRef.value,
      name: props.name,
      url: props.url,
      coordinates: hexagonRef.value!.getBoundingClientRect(),
      position: position.value
    }
    store.registerHexagon(data)
    $bus.$emit('hexagon-registered', data)
  }
}

/**
 * Update the position of the hexagon relative to its parent hexagon
 */
const updatePosition = () => {
  const parent = hexagons.value.get(props.attachedTo)
  if (!parent || !hexagonRef.value) return { x: 0, y: 0 }
  const width = hexagonRef.value.clientWidth || Number.parseInt(props.size)
  const offset = getHexEdgeOffset(parent.coordinates.width, width)
  position.value = {
    x: parent.position.x + offset.x,
    y: parent.position.y + offset.y
  }
}

/**
 * Handle mouse enter/exit event on hexagon. Primarily used to control the
 * visibility of the mouse indicator.
 */
const handleMouseEnterLeave = (status: boolean) => {
  store.setIsHoveringHexagonName(status ? belongsToHexNode : '')
}

/**
 * When a parent hexagon is registered and positioned, initialize positioning of dependent hexagons
 * @param event - The event and hexagon data
 */
const handleHexagonRegistered = (event: unknown) => {
  const { name } = event as Hexagon
  if (props.attachedTo === name) {
    if (!hexagonRef.value) return
    updatePosition()
    visible.value = true
  }
}

/**
 * When hexagons are registered or their properties are updated, update their position
 */
watch(
  () => [hexagons.value, props.attachedTo, props.side, props.size],
  updatePosition
)


$bus.$on('hexagon-registered', handleHexagonRegistered)

onMounted(() => {
  // Start the animation chain
  if (props.attachedTo === 'origin') {
    visible.value = true
  }
  hexagonRef.value?.addEventListener('transitionend', handleTransitionEnd)
})

onBeforeUnmount(() => {
  hexagonRef.value?.removeEventListener('transitionend', handleTransitionEnd)
  $bus.$off('hexagon-registered', handleHexagonRegistered)
})
</script>

<style lang="scss" scoped>
.hex {
  position: absolute;
  top: 50%;
  left: 50%;
  width: var(--size);
  height: calc(var(--size) * 1.15470053838);
  transform-origin: center center;
  opacity: 0;
  transition: opacity 250ms ease;
  &:not(.show-blueprint) {
    clip-path: polygon( 46.552% 1.244%,46.552% 1.244%,47.206% 0.952%,47.883% 0.725%,48.579% 0.562%,49.287% 0.465%,50% 0.433%,50.713% 0.465%,51.421% 0.562%,52.117% 0.725%,52.794% 0.952%,53.448% 1.244%,96.324% 22.998%,96.324% 22.998%,96.939% 23.35%,97.501% 23.752%,98.009% 24.2%,98.459% 24.69%,98.848% 25.216%,99.172% 25.775%,99.43% 26.363%,99.618% 26.973%,99.733% 27.603%,99.772% 28.247%,99.772% 71.754%,99.772% 71.754%,99.733% 72.397%,99.618% 73.027%,99.43% 73.637%,99.172% 74.225%,98.848% 74.784%,98.459% 75.311%,98.009% 75.8%,97.501% 76.248%,96.939% 76.651%,96.324% 77.002%,53.448% 98.756%,53.448% 98.756%,52.794% 99.048%,52.117% 99.275%,51.421% 99.437%,50.713% 99.535%,50% 99.567%,49.287% 99.535%,48.579% 99.437%,47.883% 99.275%,47.206% 99.048%,46.552% 98.756%,3.677% 77.002%,3.677% 77.002%,3.062% 76.651%,2.499% 76.248%,1.991% 75.8%,1.541% 75.311%,1.152% 74.784%,0.828% 74.225%,0.57% 73.637%,0.382% 73.027%,0.267% 72.397%,0.228% 71.754%,0.228% 28.247%,0.228% 28.247%,0.267% 27.603%,0.382% 26.973%,0.57% 26.363%,0.828% 25.775%,1.152% 25.216%,1.541% 24.69%,1.991% 24.2%,2.499% 23.752%,3.062% 23.35%,3.677% 22.998%,46.552% 1.244% );
  }
  &.visible {
    opacity: 1;
  }
  &.selected {
    z-index: 200;
  }
  &.show-blueprint,
  &.show-outline {
    &:after,
    &:before {
      display: block;
    }
    .hex-content {
      display: none;
    }
  }
  &.not-clipped {
    clip-path: none;
  }
  &:after {
    content: '';
    display: none;
    position: absolute;
    top: 50%;
    left: 50%;
    width: 4px;
    height: 4px;
    background-color: var(--color-dark);
    border-radius: 50%;
    transform: translate(-50%, -50%);
  }
  &:before {
    content: '';
    display: none;
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: var(--color-medium);
    clip-path: polygon(0% 25%, 0% 75%, 50% 100%, 100% 75%, 100% 25%, 50% 0%);
  }
}

.hex-content {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}
</style>
