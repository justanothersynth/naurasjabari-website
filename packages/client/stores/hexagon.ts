import { defineStore } from 'pinia'

import type { Hexagon, HexNode } from '@/types/hexagon'

export const useHexagonStore = defineStore('hexagon', () => {

  // ===================================================================== state
  const hexagons = ref<Map<string, Hexagon>>(new Map())
  const hexNodes = ref<Map<string, HexNode>>(new Map())
  const hexCanvasTranslation = ref({ x: 0, y: 0 })
  const selectedHexNode = ref<HexNode | null>(null)
  const isHoveringHexagonName = ref<string>('')
  const isHoveringCanvas = ref<HTMLElement | null>(null)

  // ================================================================== computed
  const selectedHexagon = computed(() => Array.from(hexagons.value.values()).find(hexagon => hexagon.selected === true))

  // =================================================================== actions
  /**
   * Registers a hexagon in the store
   * @param hexagon - The hexagon to register
   */
  const registerHexagon = (hexagon: Hexagon) => {
    hexagons.value.set(hexagon.name, hexagon)
  }

  /**
   * Retrieves a hexagon from the store by name
   * @param name - The name of the hexagon to retrieve
   * @returns The hexagon object if found, otherwise undefined
   */
  const getHexagon = (name: string) => {
    return hexagons.value.get(name)
  }

  /**
   * Updates a hexagon in the store
   * @param hexagon - The hexagon to update
   */
  const updateHexagon = (hexagon: Hexagon) => {
    hexagons.value.set(hexagon.name, hexagon)
  }

  /**
   * Registers a hex node in the store
   * @param hexNode - The hex node to register
   */
  const registerHexNode = (hexNode: HexNode) => {
    hexNodes.value.set(hexNode.name, hexNode)
  }

  /**
   * Retrieves a hex node from the store by name
   * @param name - The name of the hex node to retrieve
   * @returns The hex node object if found, otherwise undefined
   */
  const getHexNode = (name: string) => {
    return hexNodes.value.get(name)
  }

  /**
   * Updates the hex canvas translation coordinates
   * @param translation - Object containing x and y offset values
   */
  const setHexCanvasTranslation = (translation: { x: number; y: number }) => {
    hexCanvasTranslation.value = translation
  }

  /**
   * Sets the selected hex node
   * @param hexNode - The hex node to set as selected
   */
  const setSelectedHexNode = (hexNode: HexNode) => {
    selectedHexNode.value = hexNode
  }

  /**
   * Sets which hexagon is currently being hovered
   * @param hovering - True if hovering over a hexagon, false otherwise
   * @param hexagonName - The name of the hexagon being hovered (optional)
   */
  const setIsHoveringHexagonName = (hexagonName: string) => {
    isHoveringHexagonName.value = hexagonName
  }

  /**
   * Sets whether the canvas is currently being hovered
   * @param hovering - True if hovering over the canvas, false otherwise
   */
  const setIsHoveringCanvas = (hovering: HTMLElement | null) => {
    isHoveringCanvas.value = hovering as HTMLElement
  }

  // ==================================================================== return
  return {
    // ----- state
    hexagons,
    hexNodes,
    hexCanvasTranslation,
    selectedHexNode,
    isHoveringHexagonName,
    isHoveringCanvas,
    // ----- computed
    selectedHexagon,
    // ----- actions
    registerHexagon,
    getHexagon,
    updateHexagon,
    registerHexNode,
    getHexNode,
    setHexCanvasTranslation,
    setSelectedHexNode,
    setIsHoveringHexagonName,
    setIsHoveringCanvas
  }
})
