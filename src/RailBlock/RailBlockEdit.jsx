import React from 'react';
import { v4 as uuid } from 'uuid';
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
import { setSidebarTab } from '@plone/volto/actions';
import { useDispatch } from 'react-redux';

import configSVG from '@plone/volto/icons/configuration.svg';
import clearSVG from '@plone/volto/icons/clear.svg';

import './rail.css';

const EMPTY = '_empty';

const BlockPlaceholder = (props) => {
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

const emptyBlock = (defaultBlockType, cols = 3, mainColumnIndex) => {
  const blockIds = new Array(cols).fill(null).map(() => uuid());

  const blocks = Object.assign(
    {},
    ...blockIds.map((id, index) => ({
      [id]: { '@type': index === mainColumnIndex ? defaultBlockType : EMPTY },
    })),
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

const mutateBlock = (formData, blockId, value, id) => {
  const index = formData?.blocks_layout?.items.indexOf(blockId);
  const newId = id || blockId;

  return {
    ...formData,
    blocks: Object.assign(
      {},
      ...Object.keys(formData.blocks)
        .filter((bid) => bid !== blockId)
        .map((bid) => ({ [bid]: formData.blocks[bid] })),
      { [newId]: value },
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
  const {
    defaultBlockType = 'text',
    columnsCount = 3,
    mainColumnIndex = 1,
  } = config.blocks.blocksConfig.row;

  const hasData = Object.keys(data.blocks || {}).length > 0;

  // The internal storage model is: {blocks, blocks_layout}
  React.useEffect(() => {
    if (!hasData) {
      onChangeBlock(
        block,
        emptyBlock(defaultBlockType, columnsCount, mainColumnIndex),
      );
    }
  }, [
    block,
    hasData,
    defaultBlockType,
    onChangeBlock,
    columnsCount,
    mainColumnIndex,
  ]);

  const [selectedBlock, setSelectedBlock] = React.useState(mainColumnIndex);
  const node = React.createRef();
  const dispatch = useDispatch();

  return (
    <div className="rail-block" ref={node}>
      {selected && 'selected'}
      {selectedBlock}

      {selected && (
        <div className="toolbar">
          <Button.Group>
            <Button
              aria-label={`Select row block`}
              icon
              basic
              onClick={(e) => {
                e.stopPropagation();
                setSelectedBlock(null);
                node.current.focus();
                dispatch(setSidebarTab(1));
              }}
            >
              <Icon name={configSVG} size="24px" />
            </Button>
          </Button.Group>
        </div>
      )}

      <Grid centered columns={data?.blocks_layout?.items?.length || 1}>
        {getBlocks(data).map(([blockId, blockData], index) => (
          <Grid.Column key={index}>
            <BlockDelegate
              onClick={(e) => {
                if (selectedBlock !== index) setSelectedBlock(index);
              }}
              id={block}
              pathname={pathname}
              properties={data}
              metadata={metadata}
              type={blockData['@type']}
              onAddBlock={props.onAddBlock}
              onInsertBlock={(id, value) => {
                const newFormData = mutateBlock(data, blockId, value);
                onChangeBlock(block, newFormData);
              }}
              onDeleteBlock={(id) => {
                const newFormData = deleteBlock(data, id);
                onChangeBlock(block, newFormData);
              }}
              onFocusPreviousBlock={props.onFocusPreviousBlock}
              onFocusNextBlock={props.onFocusNextBlock}
              onSelectBlock={props.onSelectBlock}
              onChangeBlock={(blockId, value) => {
                const newFormData = changeBlock(data, blockId, value);
                onChangeBlock(block, newFormData);
              }}
              onMutateBlock={(id, value) => {
                const newFormData = mutateBlock(data, blockId, value, uuid());
                onChangeBlock(block, newFormData);
              }}
              data={blockData}
              block={blockId}
              isMainBlock={index === mainColumnIndex}
              index={index}
              selected={selected && index === selectedBlock}
              handleKeyDown={() => {
                // TODO: handle this
                console.log('handleKeyDown');
              }}
              onMoveBlock={() => {
                // TODO: handle this
                console.log('onMoveBlock');
              }}
              onChangeField={() => {
                // TODO: handle this
                console.log('onChangeField');
              }}
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
