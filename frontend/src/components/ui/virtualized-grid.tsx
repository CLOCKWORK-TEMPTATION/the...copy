import type { CSSProperties, ReactNode } from "react"

export interface VirtualizedGridProps<T> {
  items: T[]
  renderItem: (item: T, index: number) => ReactNode
  columnCount?: number
  itemHeight?: number
  itemWidth?: number
  className?: string
}

export function VirtualizedGrid<T>({
  items,
  renderItem,
  columnCount = 1,
  itemHeight,
  itemWidth,
  className,
}: VirtualizedGridProps<T>) {
  const gridStyle: CSSProperties = {
    display: "grid",
    gridTemplateColumns: `repeat(${columnCount}, minmax(0, 1fr))`,
    gap: "1.5rem",
  }

  const itemStyle: CSSProperties = {}
  if (itemHeight !== undefined) itemStyle.minHeight = itemHeight
  if (itemWidth !== undefined) itemStyle.minWidth = itemWidth

  return (
    <div className={className} style={gridStyle}>
      {items.map((item, index) => (
        <div key={index} style={itemStyle}>
          {renderItem(item, index)}
        </div>
      ))}
    </div>
  )
}

export default VirtualizedGrid
