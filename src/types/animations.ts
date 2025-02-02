export interface Keyframe {
  time: number
  properties: Record<string, string>
}

export interface Animation {
  element: string
  keyframes: Keyframe[]
}

