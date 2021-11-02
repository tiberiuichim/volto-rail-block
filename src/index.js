// import React from 'react';

import listBulletSVG from '@plone/volto/icons/list-bullet.svg';
import {
  RailBlockView,
  RailBlockEdit,
  FloatedColumnsLayout,
  GridColumnsLayout,
} from './RailBlock';

const applyConfig = (config) => {
  // TODO: rename to Rail???
  config.blocks.blocksConfig.row = {
    id: 'row',
    title: 'Row',
    icon: listBulletSVG,
    group: 'common',
    view: RailBlockView,
    edit: RailBlockEdit,
    restricted: false,
    mostUsed: true,
    sidebarTab: 1,
    showLinkMore: false,
    security: {
      addPermission: [],
      view: [],
    },
    defaultBlockType: config.settings.defaultBlockType,
    blockHasOwnFocusManagement: true,
    columnsCount: 3,
    mainColumnIndex: 1,
    variations: [
      {
        isDefault: true,
        id: 'floated',
        title: 'Floated columns',
        template: FloatedColumnsLayout,
      },
      {
        isDefault: false,
        id: 'grid',
        title: 'Grid columns',
        template: GridColumnsLayout,
      },
    ],
  };

  config.settings.defaultBlockType = 'row';

  return config;
};

export default applyConfig;
