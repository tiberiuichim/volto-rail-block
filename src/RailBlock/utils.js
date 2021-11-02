import { v4 as uuid } from 'uuid';

const EMPTY = '_empty';

export const emptyBlock = (defaultBlockType, cols = 3, mainColumnIndex) => {
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
    mainColumnIndex,
    blocks,
    blocks_layout,
  };
};

export const blockHasValue = (data) => data?.['@type'] !== EMPTY;

export const mutateBlock = (formData, blockId, value, id) => {
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

export const deleteBlock = (formData, blockId) => {
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
