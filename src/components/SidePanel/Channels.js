import React, { Component } from 'react';
import { Menu, Icon, Modal, Form, Input, Button } from 'semantic-ui-react';
import { connect } from 'react-redux';
import { setCurrentChannel, setPrivateChannel } from '../../actions';
import firebase from '../../firebase';

class Channels extends Component {

  state = {
    user: this.props.currentUser,
    activeChannel: '',
    channels: [],
    channelName: '',
    channelDetails: '',
    channelsRef: firebase.database().ref('channels'),
    modal: false,
    firstLoad: true
  }

  componentDidMount() {
    this.addListeners();
  }

  componentWillUnmount() {
    this.removeListeners();
  }

  addListeners = () => {
    let loadedChannels = [];
    this.state.channelsRef.on('child_added', snap => {
      loadedChannels.push(snap.val());
      this.setState({ channels: loadedChannels}, () => this.setFirstChannel());
    })
  }

  removeListeners = () => {
    this.state.channelsRef.off();
  }

  setFirstChannel = () => {
    if(this.state.firstLoad && this.state.channels.length > 0) {
      const firstChannel = this.state.channels[0];
      this.props.setCurrentChannel(firstChannel);
      this.setActiveChannel(firstChannel);
      this.setState({ firstLoad: false});
    }
  }

  handleSubmit = event => {
    event.preventDefault();
    if(this.isFormValid(this.state)) {
      this.addChannel();
    }
  }

  addChannel = () => {
    const { channelsRef, channelName, channelDetails, user } = this.state;
    const key = channelsRef.push().key;
    const newChannel = {
      id: key,
      name: channelName,
      details: channelDetails,
      createdBy: {
        name: user.displayName,
        avatar: user.photoURL
      }
    };

    channelsRef
      .child(key)
      .update(newChannel)
      .then(() => {
        this.setState({ channelName: '', channelDetails: '' });
        this.closeModal();
        console.log('channel added')
      })
      .catch(err => console.error(err))
    
  }

  isFormValid = ({ channelName, channelDetails }) => channelName && channelDetails;

  handleChange = event => {
    this.setState({ [event.target.name]: event.target.value });
  }

  openModal = () => this.setState({ modal: true });

  closeModal = () => this.setState({ modal: false });

  changeChannel = channel => {
    this.setActiveChannel(channel);
    this.props.setCurrentChannel(channel);
    this.props.setPrivateChannel(false);
  }

  setActiveChannel = channel => {
    this.setState({ activeChannel: channel.id })
  }

  displayChannels = channels => (
    channels.length > 0 && channels.map(channel => (
      <Menu.Item
        key={channel.id}
        onClick={() => this.changeChannel(channel)}
        name={channel.name}
        style={{ opacity: 0.7}}
        active={channel.id === this.state.activeChannel}
      >
        # {channel.name}
      </Menu.Item>
    ))
  );

  render() {
    const { channels, modal, channelName, channelDetails } = this.state;
    return (
      <React.Fragment>
      <Menu.Menu className='menu'>
          <Menu.Item>
            <span>
              <Icon name='exchange' /> CHANNELS
            </span>{' '}
            ({ channels.length }) <Icon name='add' onClick={this.openModal} />
          </Menu.Item>
          {this.displayChannels(channels)}
      </Menu.Menu>

      <Modal basic open={modal} onClose={this.closeModal}>
        <Modal.Header>Add a Channel</Modal.Header>
        <Modal.Content>
          <Form onSubmit={this.handleSubmit}>
            <Form.Field>
              <Input fluid label='Channel Name' name='channelName' onChange={this.handleChange} value={channelName} />
            </Form.Field>

            <Form.Field>
              <Input fluid label='Channel Details' name='channelDetails' onChange={this.handleChange} value={channelDetails} />
            </Form.Field>
          </Form>
        </Modal.Content>

        <Modal.Actions>
          <Button color='green' inverted onClick={this.handleSubmit}>
            <Icon name='checkmark' /> Add
          </Button>
          <Button color='red' inverted>
            <Icon name='remove' onClick={this.closeModal} /> Cancel
          </Button>
        </Modal.Actions>
      </Modal>
      </React.Fragment>
    );
  }
}

export default connect(null, { setCurrentChannel, setPrivateChannel })(Channels);