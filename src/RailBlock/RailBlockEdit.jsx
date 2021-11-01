import React from 'react';
import { Grid } from 'semantic-ui-react';
import {
  BlockChooserButton,
  BlockDataForm,
  SidebarPortal,
} from '@plone/volto/components';
import { RailBlockSchema } from './schema';
import config from '@plone/volto/registry';
import EditBlock from '@plone/volto/components/manage/Blocks/Block/Edit';
import { ButtonComponent } from '@plone/volto/components/manage/BlockChooser/BlockChooserButton';

import './rail.css';

const BlockPlaceholder = () => {
  const [visible, setVisible] = React.useState(false);
  return (
    <div className="block-placeholder">
      <BlockChooserButton
        data={{ '@type': 'text' }}
        buttonComponent={(props) => <ButtonComponent {...props} className="" />}
      />
    </div>
  );
};

const RailBlockEdit = (props) => {
  const { selected, onChangeBlock, block, data = {} } = props;
  const schema = RailBlockSchema();
  const { blocks = {}, blocks_layout = {} } = data;
  const { defaultBlockType = 'text' } = config.blocks.blocksConfig.row;
  const defaultBlockConfig = config.blocks.blocksConfig[defaultBlockType];
  const DefaultBlockEdit = defaultBlockConfig.edit;

  // The internal storage model is: MainColumn, LeftColumn, RightColumn

  return (
    <div className="rail-block">
      <Grid centered columns="3">
        <Grid.Column>
          <BlockPlaceholder />
        </Grid.Column>
        <Grid.Column>
          <DefaultBlockEdit {...props} />
        </Grid.Column>
        <Grid.Column>
          <BlockPlaceholder />
        </Grid.Column>
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
