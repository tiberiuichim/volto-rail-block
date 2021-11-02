import React from 'react';
import { Button, Grid } from 'semantic-ui-react';
import {
  BlockChooserButton,
  BlockDataForm,
  SidebarPortal,
  Icon,
} from '@plone/volto/components';
import { RailBlockSchema } from './schema';
import config from '@plone/volto/registry';
import EditBlock from '@plone/volto/components/manage/Blocks/Block/Edit';
import { ButtonComponent } from '@plone/volto/components/manage/BlockChooser/BlockChooserButton';
import { getBlocks, changeBlock } from '@plone/volto/helpers';
import { v4 as uuid } from 'uuid';

import clearSVG from '@plone/volto/icons/clear.svg';

import './rail.css';

const EMPTY = '_empty';

const BlockPlaceholder = (props) => {
  // const [visible, setVisible] = React.useState(false);
  // TODO: right now we rely on BlockChooser being able to recognize empty text
  // as empty block.
  return (
    <div className="block-placeholder">
      <BlockChooserButton
        {...props}
        data={{ '@type': 'text' }}
        buttonComponent={(props) => <ButtonComponent {...props} className="" />}
      />
    </div>
  );
};

const emptyBlock = (defaultBlockType, cols = 3) => {
  const blockIds = new Array(cols).fill(null).map(() => uuid());

  const blocks = Object.assign(
    {},
    ...blockIds.map((id) => ({ [id]: { '@type': defaultBlockType } })),
  );
  const blocks_layout = { items: blockIds };

  return {
    '@type': 'row',
    blocks,
    blocks_layout,
  };
};

const blockHasValue = (data) => data?.['@type'] !== EMPTY;

const BlockDelegate = (props) => {
  const {
    block,
    data,
    isMainBlock = false,
    onMutateBlock,
    onClick,
    index,
  } = props;
  const { defaultBlockType = 'text' } = config.blocks.blocksConfig.row;
  const { edit: DefaultBlockEdit } = config.blocks.blocksConfig[
    defaultBlockType
  ];

  return blockHasValue(data) ? (
    <div
      className={`block-editor-${data['@type']}`}
      role="presentation"
      onClick={onClick}
      onKeyDown={onClick}
    >
      {!isMainBlock ? (
        <Button
          aria-label={`Remove row element ${index}`}
          basic
          icon
          onClick={(e) => props.onDeleteBlock(block)}
          className="remove-block-button"
        >
          <Icon name={clearSVG} className="circled" size="24px" />
        </Button>
      ) : (
        ''
      )}
      <EditBlock {...props} detached={!isMainBlock} />
    </div>
  ) : isMainBlock ? (
    <div
      className={`block-editor-${data['@type']}`}
      role="presentation"
      onClick={onClick}
      onKeyDown={onClick}
    >
      <DefaultBlockEdit {...props} detached={false} />
    </div>
  ) : (
    <BlockPlaceholder onMutateBlock={onMutateBlock} block={block} />
  );
};

const mutateBlock = (formData, blockId, id, value) => {
  const index = formData?.blocks_layout?.items.indexOf(blockId);
  return {
    ...formData,
    blocks: Object.assign(
      {},
      ...Object.keys(formData.blocks)
        .filter((bid) => bid !== blockId)
        .map((bid) => ({ [bid]: formData.blocks[bid] })),
      { [id]: value },
    ),
    blocks_layout: {
      ...formData.blocks_layout,
      items: [
        ...formData.blocks_layout.items.slice(0, index),
        id,
        ...formData.blocks_layout.items.slice(index + 1),
      ],
    },
  };
};

const deleteBlock = (formData, blockId) => {
  const index = formData?.blocks_layout?.items.indexOf(blockId);
  const newId = uuid();
  return {
    ...formData,
    blocks: Object.assign(
      {},
      ...Object.keys(formData.blocks)
        .filter((bid) => bid !== blockId)
        .map((bid) => ({ [bid]: formData.blocks[bid] })),
      { [newId]: { '@type': EMPTY } },
    ),
    blocks_layout: {
      ...formData.blocks_layout,
      items: [
        ...formData.blocks_layout.items.slice(0, index),
        newId,
        ...formData.blocks_layout.items.slice(index + 1),
      ],
    },
  };
};

const RailBlockEdit = (props) => {
  const {
    selected,
    onChangeBlock,
    block,
    data = {},
    metadata,
    pathname,
  } = props;
  const schema = RailBlockSchema();
  // const { blocks = {}, blocks_layout = {} } = data;
  const {
    defaultBlockType = 'text',
    columnsCount = 3,
    mainColumnIndex = 1,
  } = config.blocks.blocksConfig.row;

  const hasData = Object.keys(data.blocks || {}).length > 0;

  // The internal storage model is: {blocks, blocks_layout}
  React.useEffect(() => {
    if (!hasData) {
      onChangeBlock(block, emptyBlock(defaultBlockType, columnsCount));
    }
  }, [block, hasData, defaultBlockType, onChangeBlock, columnsCount]);

  const [selectedBlock, setSelectedBlock] = React.useState(mainColumnIndex);

  return (
    <div className="rail-block">
      <Grid centered columns={columnsCount}>
        {getBlocks(data).map(([blockId, blockData], index) => (
          <Grid.Column key={index}>
            <BlockDelegate
              onClick={(e) => {
                if (selectedBlock !== index) setSelectedBlock(index);
              }}
              id={block}
              onChangeField={(id, value) => {}}
              pathname={pathname}
              properties={data}
              metadata={metadata}
              type={blockData['@type']}
              handleKeyDown={() => {}}
              onAddBlock={() => {}}
              onMoveBlock={() => {}}
              onInsertBlock={() => {}}
              onDeleteBlock={(id) => {
                const newFormData = deleteBlock(data, id);
                onChangeBlock(block, newFormData);
              }}
              onFocusPreviousBlock={props.onFocusPreviousBlock}
              onFocusNextBlock={props.onFocusNextBlock}
              onSelectBlock={() => {}}
              onChangeBlock={(blockId, value) => {
                const newFormData = changeBlock(data, blockId, value);
                onChangeBlock(block, newFormData);
              }}
              onMutateBlock={(id, value) => {
                const newFormData = mutateBlock(data, blockId, uuid(), value);
                onChangeBlock(block, newFormData);
              }}
              data={blockData}
              block={blockId}
              isMainBlock={index === mainColumnIndex}
              index={index}
              selected={selected && index === selectedBlock}
            />
          </Grid.Column>
        ))}
      </Grid>

      <SidebarPortal selected={selected}>
        <BlockDataForm
          schema={schema}
          title={schema.title}
          onChangeField={(id, value) => {
            onChangeBlock(block, {
              ...data,
              [id]: value,
            });
          }}
          formData={data}
        />
      </SidebarPortal>
    </div>
  );
};

export default RailBlockEdit;

//<BlockChooserButton
//  data={this.props.data}
//  block={this.props.block}
//  onInsertBlock={(id, value) => {
//    this.props.onSelectBlock(this.props.onInsertBlock(id, value));
//  }}
//  allowedBlocks={this.props.allowedBlocks}
//  blocksConfig={this.props.blocksConfig}
//  size="24px"
//  className="block-add-button"
//  properties={this.props.properties}
///>
