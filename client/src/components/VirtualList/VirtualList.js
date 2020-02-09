import React from 'react';
import { FixedSizeList } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';

const VirtualList = ({ height, itemHeigh, items, renderItem }) => {
  return (
    <div style={{ height: Math.min(height, items.length * itemHeigh) }}>
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
