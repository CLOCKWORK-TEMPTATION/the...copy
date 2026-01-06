"use client"

export type DeviceType = "mobile" | "tablet" | "desktop"

export interface DeviceCapabilities {
  performanceScore: number
  deviceType: DeviceType
  hasBattery: boolean
  batteryLevel: number
  isCharging: boolean
  effectiveType: "slow-2g" | "2g" | "3g" | "4g"
  cpuCores: number
  deviceMemory: number
  maxTouchPoints: number
  downlink: number
  rtt: number
  saveData: boolean
  canUseWebGL: boolean
  canUseWebGL2: boolean
  maxFrameRate: number
}

export interface ParticleConfig {
  particleCount: number
  maxParticles: number
}

const defaultCapabilities: DeviceCapabilities = {
  performanceScore: 7,
  deviceType: "desktop",
  hasBattery: false,
  batteryLevel: 1,
  isCharging: false,
  effectiveType: "4g",
  cpuCores: 4,
  deviceMemory: 8,
  maxTouchPoints: 0,
  downlink: 10,
  rtt: 50,
  saveData: false,
  canUseWebGL: true,
  canUseWebGL2: true,
  maxFrameRate: 60,
}

const defaultParticleConfig: ParticleConfig = {
  particleCount: 60,
  maxParticles: 120,
}

export const performanceDetector = {
  getCapabilities: (): DeviceCapabilities => defaultCapabilities,
  updateCapabilities: (): DeviceCapabilities => defaultCapabilities,
  subscribe: (callback: (caps: DeviceCapabilities) => void) => {
    callback(defaultCapabilities)
    return () => {}
  },
  getParticleConfig: (): ParticleConfig => defaultParticleConfig,
  shouldDisableParticles: () => false,
  shouldReduceQuality: () => false,
  getTargetFrameRate: () => defaultCapabilities.maxFrameRate,
}

export default performanceDetector
