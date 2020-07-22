import React from 'react';
import { FixedSizeList } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';

const VirtualList = ({ maxHeight, itemHeigh, items, renderItem }) => {
  const height = Math.min(maxHeight, items.length * itemHeigh);

  return (
    <div style={{ height }}>
      <AutoSizer>
        {({ width }) => (
          <FixedSizeList
            height={height}
            width={width}
            itemSize={itemHeigh}
            itemCount={items.length}
          >
            {({ index, style }) => renderItem(items[index], { style })}
          </FixedSizeList>
        )}
      </AutoSizer>
    </div>
  );
};

export default VirtualList;
