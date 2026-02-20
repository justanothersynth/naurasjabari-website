<template>
  <div
    ref="hexNodeRef"
    :style="{ transform: hexNodeTransform }"
    class="hex-node">

    <slot />

  </div>
</template>

<script setup lang="ts">
import type { HexNode } from '@/types/hexagon'

const props = withDefaults(defineProps<{
  name: string
  attachedTo?: string
  url?: string
  radius?: number
  angle?: number
}>(), {
  attachedTo: 'origin',
  url: '/',
  radius: 0,
  angle: 0
})

provide('belongsToHexNode', props.name)

const { $bus } = useNuxtApp()
const store = useHexagonStore()
const hexNodeRef = ref<HTMLElement | null>(null)
const hexNodeOffset = ref('')
const isMounted = ref(false)

/**
 * Transform for radial positioning only
 */
const hexNodeTransform = computed(() => {
  return hexNodeOffset.value || 'translate(-50%, -50%)'
})

/**
 * Calculate the radial position of the hex node
 * @param radius - The radius of the hex node
 * @param angleInDegrees - The angle of the hex node in degrees
 * @returns The x and y coordinates of the hex node
 */
const calculateRadialPosition = (radius: number, angleInDegrees: number) => {
  const angleInRadians = angleInDegrees * (Math.PI / 180)
  return {
    x: radius * Math.sin(angleInRadians),
    y: -radius * Math.cos(angleInRadians)
  }
}

/**
 * Position the hex node along a radius from the center of the hex node
 * @param targetRadius - The radius of the hex node
 * @param targetAngle - The desired angle of the hex node, in degrees
 */
const positionAlongRadius = (targetRadius: number, targetAngle: number) => {
  const { x, y } = calculateRadialPosition(targetRadius, targetAngle)
  if (hexNodeRef.value) {
    hexNodeOffset.value = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`
  }
}

const handleHexNodeMounted = (event: unknown) => {
  const { name, radius } = event as HexNode
  if (props.attachedTo === name) {
    positionAlongRadius(radius, props.angle)
  }
}

$bus.$on('hex-node-mounted', handleHexNodeMounted)

onMounted(() => {
  const data: HexNode = {
    ref: hexNodeRef.value,
    name: props.name,
    url: props.url,
    attachedTo: props.attachedTo,
    radius: props.radius
  }
  store.registerHexNode(data)
  if (props.attachedTo === 'origin') {
    store.setSelectedHexNode(data)
  }
  $bus.$emit('hex-node-mounted', data)
  isMounted.value = true
})

onBeforeUnmount(() => {
  $bus.$off('hex-node-mounted', handleHexNodeMounted)
})
</script>

<style lang="scss" scoped>
.hex-node {
  position: absolute;
  top: 50%;
  left: 50%;
  font-size: toRem(12);
}

.overlay {
  position: absolute;
  bottom: 0;
  left: -50vw;
  width: 100vw;
  height: 100vh;
  background: linear-gradient(to top, var(--color-pale), transparent);
  opacity: 0;
  z-index: 100;
  pointer-events: none;
  &:after {
    content: '';
    position: absolute;
    top: calc(100% - 1px);
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(to bottom, var(--color-pale));
  }
  &.visible {
    opacity: 1;
    pointer-events: all;
  }
}
</style>
