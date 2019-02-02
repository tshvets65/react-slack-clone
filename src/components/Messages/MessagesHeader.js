import React, { Component } from 'react';
import { Header, Segment, Input, Icon} from 'semantic-ui-react';

class MessagesHeader extends Component {
  render() {
    return (
      <Segment clearing>
        <Header fluid='true' as='h2' floated='left' style={{ margiBottom: 0 }}>
          <span>
            Channel
            <Icon name='star outline' color='black' />
            <Header.Subheader>2 Users</Header.Subheader>
          </span>
        </Header>

        {/* Channel Search Input */}
        <Header floated='right'>
          <Input
            size='mini'
            icon='search'
            name='searchTerm'
            plaveholder='Search Messages'
          />
        </Header>
      </Segment>
    );
  }
}

export default MessagesHeader;