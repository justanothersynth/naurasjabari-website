<template>
  <div
    :style="{ transform: `translate(${x - 20}px, ${y - 155}px)` }"
    :class="['mouse-hex-node-indicator', {
      visible: mouseHexNodeVisible && isHoveringCanvas && isHoveringHexagonName === '',
      'visit-button-visible': visitButtonVisible,
      'target-node-info-visible': targetNodeInfo
    }]">

    <div class="percentage">
      {{ Math.round(targetNodeInfo?.percentage ?? 0) }}%
    </div>

    <div class="target-node-info">
      <div
        class="arrow"
        :style="{ transform: `rotate(${targetNodeInfo?.angle}deg)` }">
        <Icon name="mdi:arrow-up" size="24" />
      </div>
      <div class="target-node-name">
        {{ targetNodeName }}
      </div>
    </div>

    <RaisedButton :class="['visit-button', { active: visitButtonActive }]">
      Take a look
    </RaisedButton>

  </div>
</template>

<script setup lang="ts">
type Coordinates = {
  x: number
  y: number
}

const { $bus } = useNuxtApp()

const { onMousePressStart, onMousePressEnd } = useGlobalMousePress()

const { x, y } = useMouse({ type: 'client' })
const generalStore = useGeneralStore()
const hexagonStore = useHexagonStore()
const {
  hexNodes,
  selectedHexNode,
  isHoveringHexagonName,
  isHoveringCanvas
} = storeToRefs(hexagonStore)

const mouseHexNodeVisible = ref(false)
const visitButtonVisible = ref(false)
const visitButtonActive = ref(false)

const settings = {
  minPercentage: 30,
  maxPercentage: 50
}

/**
 * Percentage of the way the mouse is from selected node to target node
 */
const computedPercentage = computed(() => {
  if (!selectedHexNode.value || !import.meta.client) return 0

  // Use viewport coordinates for mouse position
  const mousePos = { x: x.value, y: y.value } as Coordinates
  const selectedNode = hexagonStore.getHexNode(selectedHexNode.value.name)
  
  if (!selectedNode?.ref) return 0

  // console.log(selectedNode)
  
  const selectedNodePos = getHexNodeViewportPosition(selectedNode.ref)
  let closestNode = null
  let shortestDistance = Infinity
  
  // Find the closest non-selected node to the mouse
  for (const [nodeName, hexNode] of hexNodes.value.entries()) {
    if (nodeName === selectedHexNode.value.name || !hexNode.ref) continue
    // console.log(nodeName)
    const nodePos = getHexNodeViewportPosition(hexNode.ref)
    const distance = calculateDistance(mousePos, nodePos)
    if (distance < shortestDistance) {
      shortestDistance = distance
      closestNode = { name: nodeName, position: nodePos, hexNode }
    }
  }
  
  if (!closestNode) return 0
  
  // Calculate distance from mouse to the closest node
  const mouseToClosestDistance = calculateDistance(mousePos, closestNode.position)
  // Calculate distance from selected node to the closest node
  const selectedToClosestDistance = calculateDistance(selectedNodePos, closestNode.position)
  
  // If mouse is farther from the closest node than the selected node is,
  // the mouse has moved past the target - don't show indicator
  if (mouseToClosestDistance > selectedToClosestDistance) return 0
  
  return calculateProgressPercentage(mousePos, selectedNodePos, closestNode.position)
})

/**
 * Find which node the mouse is moving towards and calculate progress
 */
const targetNodeInfo = computed(() => {
  if (!selectedHexNode.value || !import.meta.client) return null
  
  // Use viewport coordinates for mouse position
  const mousePos = { x: x.value, y: y.value } as Coordinates
  const selectedNode = hexagonStore.getHexNode(selectedHexNode.value.name)

  if (!selectedNode?.ref) return null
  
  let closestNode = null
  let shortestDistance = Infinity
  
  // Find the closest non-selected node to the mouse
  for (const [nodeName, hexNode] of hexNodes.value.entries()) {
    if (nodeName === selectedHexNode.value.name || !hexNode.ref) continue
    const nodePos = getHexNodeViewportPosition(hexNode.ref)
    const distance = calculateDistance(mousePos, nodePos)
    if (distance < shortestDistance) {
      shortestDistance = distance
      closestNode = { name: nodeName, position: nodePos, hexNode }
    }
  }
  
  if (!closestNode) return null
  
  // Only show info if mouse is moving away from selected node (percentage > 5)
  if (computedPercentage.value < settings.minPercentage) return null
  // Calculate angle from mouse position to target node center
  const deltaX = closestNode.position.x - mousePos.x
  const deltaY = closestNode.position.y - mousePos.y
  // atan2 gives angle from positive x-axis, but our arrow starts pointing up
  // We need to add 90 degrees to align with our up-pointing arrow
  const angleInRadians = Math.atan2(deltaY, deltaX)
  const angleInDegrees = (angleInRadians * (180 / Math.PI)) + 90
  
  return {
    name: closestNode.name,
    percentage: computedPercentage.value,
    angle: angleInDegrees
  }
})

const targetNodeName = computed(() => {
  return targetNodeInfo.value?.name.split('-').join(' ')
})

/**
 * Get the viewport position of a hex node element
 * @param hexNodeRef - The hex node element reference
 * @returns Object with x and y coordinates relative to viewport
 */
const getHexNodeViewportPosition = (hexNodeRef: HTMLElement | null) => {
  if (!hexNodeRef) return { x: 0, y: 0 } as Coordinates
  const rect = hexNodeRef.getBoundingClientRect()
  return {
    x: rect.left + rect.width / 2,
    y: rect.top + rect.height / 2
  }
}

/**
 * Calculate distance between two points
 * @param point1 - First point with x and y coordinates
 * @param point2 - Second point with x and y coordinates
 * @returns Distance between the points
 */
const calculateDistance = (point1: Coordinates, point2: Coordinates) => {
  const deltaX = point2.x - point1.x
  const deltaY = point2.y - point1.y
  return Math.sqrt(deltaX * deltaX + deltaY * deltaY)
}

/**
 * Calculate what percentage of the way the mouse is from selected node to target node
 * @param mousePos - Current mouse position
 * @param selectedPos - Position of selected hex node
 * @param targetPos - Position of target hex node
 * @returns Percentage (0-100) of how far along the path the mouse is
 */
const calculateProgressPercentage = ( mousePos: Coordinates, selectedPos: Coordinates, targetPos: Coordinates ) => {
  // Calculate total distance between selected and target nodes
  const totalDistance = calculateDistance(selectedPos, targetPos)
  if (totalDistance === 0) return 0
  // Calculate distance from selected node to mouse
  const mouseToSelectedDistance = calculateDistance(selectedPos, mousePos)
  // Calculate progress as percentage
  return Math.min((mouseToSelectedDistance / totalDistance) * 100, 100)
}

const toggleVisitButtonActive = () => {
  visitButtonActive.value = !visitButtonActive.value
}

onMousePressStart(async () => {
  if (!isHoveringCanvas.value) return
  toggleVisitButtonActive()
  await useDelay(150)
  const targetHexNode = hexagonStore.getHexNode(targetNodeInfo.value?.name ?? '')
  if (targetHexNode?.url && visitButtonVisible.value) {
    $bus.$emit('hex-node-triggered', { name: targetNodeInfo.value?.name })
  }
})
onMousePressEnd(toggleVisitButtonActive)

watch(computedPercentage, (newVal) => {
  const setForceCursorPointer = newVal > settings.maxPercentage && isHoveringHexagonName.value === ''
  visitButtonVisible.value = setForceCursorPointer
  if (!isHoveringCanvas.value) return
  generalStore.setForceCursorPointer(setForceCursorPointer)
})

onMounted(() => {
  mouseHexNodeVisible.value = true
})
</script>

<style lang="scss" scoped>
$size: 5rem;

.mouse-hex-node-indicator {
  position: fixed;
  pointer-events: none;
  opacity: 0;
  z-index: 1000;
  &.visible {
    opacity: 1;
  }
  &.target-node-info-visible {
    .target-node-info {
      transition: 150ms 10ms ease-in;
      opacity: 1;
      transform: translate(-16px, -16px);
    }
    .percentage {
      transition: 150ms 10ms ease-in;
      opacity: 1;
      transform: translateY(-16px);
    }
  }
  &.visit-button-visible {
    .target-node-info {
      transition: 50ms ease-in;
      transform: translate(-16px, -40px);
    }
    .percentage {
      transition: 50ms ease-in;
      transform: translate(0px, -40px);
      color: green;
      font-weight: 900;
    }
    .visit-button {
      transition: 150ms 10ms ease-in;
      opacity: 1;
      transform: translateY(0);
    }
  }
}

.target-node-info {
  display: flex;
  flex-direction: row;
  align-items: center;
  position: absolute;
  bottom: 1px;
  left: toRem(16);
  transform: translate(-16px, 0px);
  opacity: 0;
}

.arrow {
  display: flex;
  position: relative;
  margin-right: toRem(8);
}

.target-node-name {
  font-size: toRem(13);
  font-weight: 550;
  white-space: nowrap;
}

.percentage {
  position: absolute;
  bottom: 4px;
  right: toRem(8);
  font-size: toRem(10);
  font-weight: 500;
  opacity: 0;
}

.visit-button {
  position: absolute;
  bottom: calc(100% - 10px);
  right: toRem(-32);
  opacity: 0;
}
</style>
