import React, { Component } from 'react';
import { Header, Segment, Input, Icon} from 'semantic-ui-react';

class MessagesHeader extends Component {
  render() {
    const {channelName, numUniqueUsers, handleSearchChange, searchLoading, isPrivateChannel } = this.props;

    return (
      <Segment clearing>
        <Header fluid='true' as='h2' floated='left' style={{ margiBottom: 0 }}>
          <span>
            {channelName}
            {!isPrivateChannel && <Icon name='star outline' color='black' />}
            <Header.Subheader>{numUniqueUsers}</Header.Subheader>
          </span>
        </Header>

        {/* Channel Search Input */}
        <Header floated='right'>
          <Input
            size='mini'
            icon='search'
            name='searchTerm'
            placeholder='Search Messages'
            onChange={handleSearchChange}
            loading={searchLoading}
          />
        </Header>
      </Segment>
    );
  }
}

export default MessagesHeader;