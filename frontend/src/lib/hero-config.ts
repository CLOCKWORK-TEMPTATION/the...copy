export interface CardPosition {
  top: string
  left: string
  rotation: number
}

export interface ResponsiveConfig {
  cardPositions: CardPosition[]
  scale: number
}

export const heroConfig = {
  getResponsiveValues: (_width: number): ResponsiveConfig => ({
    cardPositions: [
      { top: "45%", left: "35%", rotation: -6 },
      { top: "50%", left: "50%", rotation: 0 },
      { top: "55%", left: "65%", rotation: 6 },
    ],
    scale: 1,
  }),
}

export default heroConfig
