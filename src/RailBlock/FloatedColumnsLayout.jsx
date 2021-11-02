import React from 'react';
import { getBlocks } from '@plone/volto/helpers';
import RenderBlock from './RenderBlock';
import { blockHasValue } from './utils';
import cx from 'classnames';

const FloatedColumnsLayout = ({ data, metadata, path, content }) => {
  const blocks = getBlocks(data);
  const { mainColumnIndex } = data;

  return blocks.map(([blockId, blockData], index) =>
    blockHasValue(blockData) ? (
      <RenderBlock
        metadata={metadata}
        path={path}
        content={content}
        key={blockId}
        data={blockData}
        block={blockId}
        as={index === mainColumnIndex ? React.Fragment : 'div'}
        wrapperProps={{
          className: cx({
            'floated-left': index < mainColumnIndex,
            'floated-right': index > mainColumnIndex,
          }),
        }}
      />
    ) : null,
  );
};

export default FloatedColumnsLayout;
