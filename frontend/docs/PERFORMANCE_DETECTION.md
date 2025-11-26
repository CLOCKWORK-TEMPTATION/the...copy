# Performance Detection & Battery Awareness System

## Overview

The Performance Detection system automatically adapts the application's visual effects and animations based on device capabilities, battery status, and network conditions. This ensures optimal performance across all devices, from high-end desktops to low-end mobile devices.

## Features

### 🔋 Battery Detection

- Monitors device battery level
- Detects charging status
- Automatically reduces effects when battery is low
- Disables animations in power-saving mode

### 🖥️ Hardware Detection

- Detects CPU cores
- Monitors available RAM
- Identifies GPU capabilities
- Adapts to maximum refresh rate

### 🌐 Network Detection

- Monitors connection type (2G, 3G, 4G, 5G)
- Tracks download speed
- Detects data-saver mode
- Adjusts asset quality accordingly

### ✨ Adaptive Particle System

- Dynamic particle count (50-800 particles)
- Variable frame rates (12-120 FPS)
- Quality settings (low, medium, high)
- Automatic effect reduction on low-end devices

## Architecture

### Core Components

#### `src/lib/performance-detection.ts`

Main utility module that provides:

- Device capability detection
- Battery status monitoring
- Network condition tracking
- Performance profile generation

```typescript
// Example usage
import { performanceDetector } from "@/lib/performance-detection";

const capabilities = performanceDetector.getCapabilities();
const config = performanceDetector.getParticleConfig();
```

#### `src/hooks/usePerformanceDetection.ts`

React hooks for component integration:

- `usePerformanceDetection()` - Main hook with all capabilities
- `useBatteryStatus()` - Battery-specific hook
- `useNetworkCondition()` - Network-specific hook
- `usePerformanceMetric()` - Subscribe to specific metrics
- `useShouldReduceAnimations()` - Animation reduction flag
- `useAdaptiveFrameRate()` - Adaptive FPS

#### `src/lib/particle-system.ts`

Optimized particle system with performance adaptation:

- `OptimizedParticleSystem` - Canvas-based particles
- `ThreeJSParticleSystem` - WebGL-based particles
- Automatic quality adjustment
- Memory-efficient rendering

## Usage Guide

### Basic Integration

```typescript
'use client';

import { usePerformanceDetection } from '@/hooks/usePerformanceDetection';

export function MyComponent() {
  const {
    config,
    shouldDisable,
    performanceScore,
    batteryLevel,
    effectiveNetworkType,
  } = usePerformanceDetection();

  // Disable particles on very low-end devices
  if (shouldDisable) {
    return <SimpleBackground />;
  }

  return (
    <ParticleBackground
      maxParticles={config?.maxParticles || 400}
      frameRate={config?.updateFrequency || 60}
      quality={config?.textureQuality || 'high'}
    />
  );
}
```

### Particle System Integration

```typescript
'use client';

import { useEffect, useRef } from 'react';
import { usePerformanceDetection } from '@/hooks/usePerformanceDetection';
import { OptimizedParticleSystem } from '@/lib/particle-system';

export function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const systemRef = useRef<OptimizedParticleSystem | null>(null);
  const { config, shouldDisable } = usePerformanceDetection();

  useEffect(() => {
    if (!canvasRef.current || shouldDisable || !config) return;

    // Initialize particle system
    systemRef.current = new OptimizedParticleSystem({
      canvas: canvasRef.current,
      width: window.innerWidth,
      height: window.innerHeight,
      config,
    });

    // Cleanup
    return () => {
      systemRef.current?.dispose();
    };
  }, [config, shouldDisable]);

  if (shouldDisable) {
    return null;
  }

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
      }}
    />
  );
}
```

### Battery Status Monitoring

```typescript
import { useBatteryStatus } from '@/hooks/usePerformanceDetection';

export function BatteryIndicator() {
  const battery = useBatteryStatus();

  return (
    <div>
      <p>Battery: {(battery.level * 100).toFixed(0)}%</p>
      <p>Status: {battery.isCharging ? 'Charging' : 'Discharging'}</p>
      {battery.isCritical && <p>⚠️ Battery is critical</p>}
    </div>
  );
}
```

### Network Condition Monitoring

```typescript
import { useNetworkCondition } from '@/hooks/usePerformanceDetection';

export function NetworkStatus() {
  const network = useNetworkCondition();

  return (
    <div>
      <p>Connection: {network.type.toUpperCase()}</p>
      <p>Downlink: {network.downlink} Mbps</p>
      <p>RTT: {network.rtt} ms</p>
      {network.isSlowConnection && (
        <p>⚠️ Slow connection detected - reducing quality</p>
      )}
    </div>
  );
}
```

### Conditional Animation Rendering

```typescript
import { useShouldReduceAnimations } from '@/hooks/usePerformanceDetection';

export function AnimatedComponent() {
  const shouldReduceAnimations = useShouldReduceAnimations();

  if (shouldReduceAnimations) {
    return <StaticComponent />;
  }

  return <FullyAnimatedComponent />;
}
```

## Performance Profiles

### High-End Devices (Score: 9-10)

- **Specs**: 8+ cores, 8GB+ RAM, 5G/WiFi
- **Particles**: 800
- **Frame Rate**: 120 FPS
- **Quality**: High
- **Effects**: All enabled (glow, blur, shadows)

### Mid-Range Devices (Score: 7-8)

- **Specs**: 4-6 cores, 4-8GB RAM, 4G
- **Particles**: 400
- **Frame Rate**: 60 FPS
- **Quality**: High
- **Effects**: All enabled

### Low-End Devices (Score: 3-6)

- **Specs**: 2-4 cores, 2-4GB RAM, 3G
- **Particles**: 150
- **Frame Rate**: 24 FPS
- **Quality**: Low
- **Effects**: Glow and blur disabled

### Very Low-End Devices (Score: 0-2)

- **Specs**: 1-2 cores, <2GB RAM, 2G
- **Particles**: 50
- **Frame Rate**: 12 FPS
- **Quality**: Low
- **Effects**: All disabled

## Battery Modes

### Normal Mode

- Battery level: > 50%
- Full particle system enabled
- All effects active

### Battery Saver Mode

- Battery level: 20-50%
- Particle count reduced by 30%
- Frame rate capped at 45 FPS

### Critical Mode

- Battery level: < 20%
- Particle count reduced by 70%
- Particles disabled if below 15%
- Frame rate capped at 24 FPS

## Network Adaptation

### Fast Network (4G/5G)

- Highest quality assets
- 800 particles maximum
- 120 FPS target

### Moderate Network (3G)

- Medium quality assets
- 400 particles
- 60 FPS target

### Slow Network (2G/Slow-2G)

- Lowest quality assets
- Particles disabled
- 24 FPS target
- Data saver mode respected

## API Reference

### `performanceDetector.getCapabilities()`

Returns current device capabilities:

```typescript
interface DeviceCapabilities {
  batteryLevel: number; // 0-1
  isCharging: boolean;
  chargingTime: number;
  dischargingTime: number;
  hasBattery: boolean;
  cpuCores: number;
  deviceMemory: number;
  maxTouchPoints: number;
  effectiveType: "4g" | "3g" | "2g" | "slow-2g" | "unknown";
  downlink: number;
  rtt: number;
  saveData: boolean;
  maxFrameRate: number;
  canUseWebGL: boolean;
  canUseWebGL2: boolean;
  supportsOffscreenCanvas: boolean;
  supportsSharedArrayBuffer: boolean;
  performanceScore: number; // 0-10
  deviceType:
    | "high-end"
    | "mid-range"
    | "low-end"
    | "mobile"
    | "tablet"
    | "desktop";
}
```

### `performanceDetector.getParticleConfig()`

Returns optimized particle configuration:

```typescript
interface ParticleConfig {
  maxParticles: number;
  particleSize: number;
  updateFrequency: number; // FPS
  enableBlur: boolean;
  enableGlow: boolean;
  enableShadows: boolean;
  textureQuality: "high" | "medium" | "low";
}
```

### `performanceDetector.shouldDisableParticles()`

Returns `true` if particles should be disabled:

- Battery < 15% and not charging
- Very slow network (2G/Slow-2G)
- Performance score < 2
- User prefers reduced motion

### `performanceDetector.shouldReduceQuality()`

Returns `true` if quality should be reduced:

- Performance score <= 5

### `performanceDetector.getTargetFrameRate()`

Returns recommended frame rate based on device capabilities.

### `performanceDetector.subscribe(callback)`

Subscribe to capability changes:

```typescript
const unsubscribe = performanceDetector.subscribe((capabilities) => {
  console.log("Capabilities changed:", capabilities);
});

// Later, unsubscribe
unsubscribe();
```

## Browser Compatibility

### Fully Supported

- Chrome 51+
- Firefox 55+
- Safari 11+
- Edge 79+

### Partially Supported

- Device Memory API: Chrome 63+, Edge 79+
- Battery Status API: Chrome 39-52 (deprecated)
- Network Information API: Chrome 61+, Android Browser

### Fallback Behavior

When APIs are unavailable, the system defaults to:

- Battery: Assumed fully charged (100%)
- Network: Assumed 4G connection
- CPU: Defaults to 4 cores
- Memory: Defaults to 8GB

## Performance Testing

### Running Performance Analysis

```bash
# Run complete performance analysis
npm run perf:analyze

# Generate full report with budget check
npm run perf:full

# Check performance budget
npm run budget:check

# Generate performance report
npm run performance:report
```

### Monitoring in Development

The system logs performance info to the console in development:

```typescript
// In development, you'll see:
// [Performance Detection] Device: mid-range desktop
// [Performance Detection] Score: 7/10
// [Performance Detection] Battery: 85% (charging)
// [Performance Detection] Network: 4g
// [Performance Detection] Particle Config: 400 particles, 60 FPS
```

### Debugging

Enable verbose logging:

```typescript
// In your component
const { capabilities, config } = usePerformanceDetection();

useEffect(() => {
  console.log("[Debug] Capabilities:", capabilities);
  console.log("[Debug] Particle Config:", config);
}, [capabilities, config]);
```

## Best Practices

### 1. Always Check `shouldDisable`

```typescript
if (shouldDisable) {
  return null; // Render nothing instead of degraded version
}
```

### 2. Adapt Content Based on Network

```typescript
if (network.isSlowConnection) {
  return <LowQualityVersion />;
}
return <HighQualityVersion />;
```

### 3. Monitor Battery Changes

```typescript
const battery = useBatteryStatus();

useEffect(() => {
  if (battery.isCritical) {
    // Disable all non-essential features
  }
}, [battery.isCritical]);
```

### 4. Use Appropriate Defaults

```typescript
// Always provide defaults for null cases
<Particles
  maxParticles={config?.maxParticles ?? 400}
  frameRate={config?.updateFrequency ?? 60}
/>
```

### 5. Test on Real Devices

Test on actual devices with various specs:

- Modern flagship (high-end)
- Mid-range Android phone
- Budget Android phone
- Older devices

## Troubleshooting

### Particles Not Appearing

1. Check `shouldDisable` flag
2. Verify canvas element exists
3. Check browser console for WebGL errors
4. Verify Three.js is properly loaded

### Performance Still Poor

1. Run `npm run perf:analyze` to identify bottlenecks
2. Check particle count - reduce manually if needed
3. Profile with Chrome DevTools Performance tab
4. Consider disabling other animations

### Battery Detection Not Working

1. Check browser support (Battery Status API deprecated)
2. Verify device has battery (desktop may not)
3. Check browser permissions
4. System will default to 100% if unavailable

### Network Detection Issues

1. Verify Network Information API support
2. Check if throttling is enabled in DevTools
3. Test on actual 3G/2G networks
4. System defaults to 4G if unavailable

## Performance Impact

### Overhead

- Detection system: ~2ms on startup, <0.1ms per update
- Particle adaptation: 0 overhead (automatic)
- React hooks: Minimal (<0.5ms per render)

### Memory Usage

- Detection module: ~50KB
- Per component instance: <5KB
- Cached configurations: <1KB

## Future Enhancements

- [ ] GPU memory detection
- [ ] Thermal throttling detection
- [ ] Display resolution adaptation
- [ ] Storage quota monitoring
- [ ] Connection speed trending
- [ ] ML-based performance prediction

## Contributing

To improve performance detection:

1. Add new metrics to `DeviceCapabilities` interface
2. Update `detectDeviceCapabilities()` to measure
3. Add new detection hook if needed
4. Update particle configs based on metrics
5. Test on real devices
6. Update documentation

## References

- [Battery Status API](https://developer.mozilla.org/en-US/docs/Web/API/Battery_Status_API)
- [Network Information API](https://developer.mozilla.org/en-US/docs/Web/API/Network_Information_API)
- [Web Performance APIs](https://developer.mozilla.org/en-US/docs/Web/API/Performance)
- [Core Web Vitals](https://web.dev/vitals/)
- [Web Dev Performance](https://web.dev/performance/)
