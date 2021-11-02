import React from 'react';
import { Grid } from 'semantic-ui-react';
import { getBlocks } from '@plone/volto/helpers';
import RenderBlock from './RenderBlock';
import { blockHasValue } from './utils';

const GridColumnsLayout = ({ data, metadata, path, content }) => {
  const blocks = getBlocks(data);
  return (
    <Grid columns={blocks.length} className="floated-columns-layout">
      {blocks.map(([blockId, blockData]) =>
        blockHasValue(blockData) ? (
          <RenderBlock
            as={Grid.Column}
            metadata={metadata}
            path={path}
            content={content}
            key={blockId}
            data={blockData}
            block={blockId}
          />
        ) : (
          // TODO: maybe don't render this?
          <Grid.Column></Grid.Column>
        ),
      )}
    </Grid>
  );
};

export default GridColumnsLayout;
