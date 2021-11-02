import React from 'react';
import config from '@plone/volto/registry';
import {
  withBlockExtensions,
  getBlocks,
  blockHasValue as voltoBlockHasValue,
} from '@plone/volto/helpers';
import { defineMessages, injectIntl } from 'react-intl';
import { compose } from 'redux';

import { blockHasValue } from './utils';

const messages = defineMessages({
  unknownBlock: {
    id: 'Unknown Block',
    defaultMessage: 'Unknown Block {block}',
  },
});

const RailBlockView = (props) => {
  const {
    data,
    path,
    intl,
    content,
    metadata,
    blocksConfig = config.blocks.blocksConfig,
    variation,
  } = props;
  const { mainColumnIndex = blocksConfig.row.mainColumnIndex ?? 1 } = data;

  const blocks = getBlocks(data);
  const secondaryBlocks = blocks.filter(
    ([, block], index) =>
      index !== mainColumnIndex &&
      blockHasValue(block) &&
      voltoBlockHasValue(block),
  );
  const needsGrid = secondaryBlocks.length > 0;
  const [mainBlockId, mainBlock] = blocks[mainColumnIndex];
  const Block = blocksConfig[mainBlock?.['@type']]?.view;
  const { template: ViewTemplate } = variation;

  return !needsGrid ? (
    Block ? (
      <Block
        id={mainBlockId}
        path={path}
        content={content}
        metadata={metadata}
        data={mainBlock}
      />
    ) : (
      <div>
        {intl.formatMessage(messages.unknownBlock, {
          block: mainBlock?.['@type'],
        })}
      </div>
    )
  ) : (
    <ViewTemplate {...props} />
  );
};

export default compose(injectIntl, withBlockExtensions)(RailBlockView);
