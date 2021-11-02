import React from 'react';
import config from '@plone/volto/registry';
import { defineMessages, injectIntl } from 'react-intl';

const messages = defineMessages({
  unknownBlock: {
    id: 'Unknown Block',
    defaultMessage: 'Unknown Block {block}',
  },
});

const RenderBlock = (props) => {
  const {
    intl,
    content,
    metadata,
    block,
    path,
    data,
    wrapperProps = {},
    as = 'div',
  } = props;
  const blocksConfig = props.blocksConfig || config.blocks.blocksConfig;
  const Block = blocksConfig[data?.['@type']]?.view;
  const CustomTag = as;

  return Block ? (
    <CustomTag {...wrapperProps}>
      <Block
        key={block}
        id={block}
        metadata={metadata}
        properties={content}
        data={data}
        path={path}
        blocksConfig={blocksConfig}
      />
    </CustomTag>
  ) : (
    <div key={block}>
      {intl.formatMessage(messages.unknownBlock, {
        block: block?.['@type'],
      })}
    </div>
  );
};

export default injectIntl(RenderBlock);
