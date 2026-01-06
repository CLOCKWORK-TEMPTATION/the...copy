/**
 * Spatial Scene Planner stub
 */
interface SpatialScenePlannerProps {
  sceneName?: string
}

export function SpatialScenePlanner({ sceneName }: SpatialScenePlannerProps) {
  return (
    <div className="p-4 border rounded">
      Spatial Scene Planner{sceneName ? `: ${sceneName}` : ""}
    </div>
  )
}

export default SpatialScenePlanner
