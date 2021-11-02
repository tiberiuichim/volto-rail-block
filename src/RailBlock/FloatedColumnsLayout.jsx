import React from 'react';
import { getBlocks } from '@plone/volto/helpers';
import RenderBlock from './RenderBlock';
import { blockHasValue } from './utils';
import cx from 'classnames';

const FloatedColumnsLayout = ({ data, metadata, path, content }) => {
  const blocks = getBlocks(data);
  const { mainColumnIndex } = data;
  const [mainBlockId, mainBlock] = blocks[mainColumnIndex];

  return (
    <>
      {blocks
        .filter((b, i) => i !== mainColumnIndex)
        .map(([blockId, blockData], index) =>
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
                className: cx('ui', {
                  left: index < mainColumnIndex,
                  right: index > mainColumnIndex,
                  floated: index < mainColumnIndex || index > mainColumnIndex,
                }),
              }}
            />
          ) : null,
        )}

      <RenderBlock
        metadata={metadata}
        path={path}
        content={content}
        data={mainBlock}
        block={mainBlockId}
        as={React.Fragment}
      />
    </>
  );
};

export default FloatedColumnsLayout;
