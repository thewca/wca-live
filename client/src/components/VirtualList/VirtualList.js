import { FixedSizeList } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';

function VirtualList({ maxHeight, itemHeight, items, renderItem }) {
  const height = Math.min(maxHeight, items.length * itemHeight);

  return (
    <div style={{ height }}>
      <AutoSizer>
        {({ width }) => (
          <FixedSizeList
            height={height}
            width={width}
            itemSize={itemHeight}
            itemCount={items.length}
          >
            {({ index, style }) => renderItem(items[index], { style })}
          </FixedSizeList>
        )}
      </AutoSizer>
    </div>
  );
}

export default VirtualList;
