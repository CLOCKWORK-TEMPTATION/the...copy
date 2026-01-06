/**
 * Virtualized Grid component
 * Renders items in a grid layout with optional virtualization for large lists
 */

import React from "react"

interface VirtualizedGridProps<T> {
  items: T[]
  renderItem: (item: T) => React.ReactElement
  columnCount: number
  itemHeight: number
  itemWidth: number
}

export function VirtualizedGrid<T>({
  items,
  renderItem,
  columnCount,
  itemHeight,
  itemWidth,
}: VirtualizedGridProps<T>) {
  // For now, render all items in a simple grid
  // TODO: Add actual virtualization for performance with large lists
  return (
    <div
      className="grid gap-4"
      style={{
        gridTemplateColumns: `repeat(${columnCount}, minmax(0, 1fr))`,
      }}
    >
      {items.map((item, index) => (
        <div
          key={index}
          style={{
            minHeight: `${itemHeight}px`,
            minWidth: `${itemWidth}px`,
          }}
        >
          {renderItem(item)}
        </div>
      ))}
    </div>
  )
}

export default VirtualizedGrid
