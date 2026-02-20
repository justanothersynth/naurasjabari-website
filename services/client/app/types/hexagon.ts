export type Hexagon = {
  ref: HTMLElement | null
  name: string
  url?: string
  coordinates: DOMRect
  position: { x: number; y: number }
  selected?: boolean
}

export type HexNode = {
  ref: HTMLElement | null
  name: string
  url: string
  attachedTo: string
  radius: number
}
