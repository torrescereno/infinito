export interface CanvasSession {
  id: string
  name: string
  createdAt: number
}

export interface CanvasSessionRegistry {
  sessions: CanvasSession[]
  activeSessionId: string
}
