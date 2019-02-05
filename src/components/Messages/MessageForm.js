import React, { Component } from 'react';
import { Segment, Button, Input } from 'semantic-ui-react';
import uuidv4 from 'uuid/v4';
import firebase from '../../firebase';
import FileModal from './FileModal';
import ProgressBar from './ProgressBar';

class MessageForm extends Component {
  
  state = {
    message: '',
    loading: false,
    channel: this.props.currentChannel,
    user: this.props.currentUser,
    errors: [],
    modal: false,
    uploadState: '',
    uploadTask: null,
    storageRef: firebase.storage().ref(),
    typingRef: firebase.database().ref('typing'),
    percentUploaded: 0
  }

  openModal = () => this.setState({ modal: true });

  closeModal = () => this.setState({ modal: false });


  handleChange = event => {
    this.setState({ [event.target.name]: event.target.value })
  }

  handleKeyDown = () => {
    const { message, typingRef, channel, user } = this.state;
    if(message) {
      typingRef
        .child(channel.id)
        .child(user.uid)
        .set(user.displayName);
    } else {
      typingRef
        .child(channel.id)
        .child(user.uid)
        .remove();
    }
  }

  createMessage = (fileUrl = null) => {
    const message = {
      timestamp: firebase.database.ServerValue.TIMESTAMP,
      user: {
        id:this.state.user.uid,
        name: this.state.user.displayName,
        avatar: this.state.user.photoURL
      },
    };
    if (fileUrl) {
      message['image'] = fileUrl;
    } else {
      message['content'] = this.state.message;
    }
    return message;
  }

  sendMessage = () => {
    const { getMessagesRef } = this.props;
    const { message, channel, user, typingRef } = this.state;
    if (message) {
      this.setState({ loading: true });
      getMessagesRef()
      .child(channel.id)
      .push()
      .set(this.createMessage())
      .then(() => {
        this.setState({ loading: false, message: '', errors: []});
        typingRef
          .child(channel.id)
          .child(user.uid)
          .remove();
      })
      .catch(err => {
        console.error(err);
        this.setState({ loading: false, errors: this.state.errors.concat(err) });
      })
    } else {
      this.setState({
        errors: this.state.errors.concat({ message: 'Add a message' })
      });
    }
  }

  getPath = () => {
    if(this.props.isPrivateChannel) {
      return `chat/private-${this.state.channel.id}`;
    } else {
      return 'chat/public';
    }
  }

  uploadFile = (file, metadata) => {
    const pathToUpload = this.state.channel.id;
    const ref = this.props.getMessagesRef();
    const filePath = `${this.getPath()}/${uuidv4()}.jpg`;

    this.setState({
      uploadState: 'uploading',
      uploadTask: this.state.storageRef.child(filePath).put(file, metadata)
    }, () => {
      this.state.uploadTask.on('state_changed', snap => {
        const percentUploaded = Math.round((snap.bytesTransferred / snap.totalBytes) * 100);
        this.setState({ percentUploaded });
      }, err => {
        console.error(err);
        this.setState({
          errors: this.state.errors.concat(err),
          uploadState: 'error',
          uploadTask: null
        });
      }, () => {
        this.state.uploadTask.snapshot.ref.getDownloadURL().then(downloadUrl => {
          this.sendFileMessage(downloadUrl, ref, pathToUpload);
        }).catch(err => {
          console.error(err);
          this.setState({
            errors: this.state.errors.concat(err),
            uploadState: 'error',
            uploadTask: null
          });
        })
      })
    })
  }

  sendFileMessage = (fileUrl, ref, pathToUpload) => {
    ref.child(pathToUpload).push().set(this.createMessage(fileUrl))
      .then(() => {
        this.setState({ uploadState: 'done' })
      })
      .catch(err => {
        console.error(err);
        this.setState({
          errors: this.state.errors.concat(err),
          uploadState: 'error',
          uploadTask: null
        });
      })
  }

  render() {
    // prettier-ignore
    const { errors, message, loading, modal, uploadState, percentUploaded } = this.state;
    return (
      <Segment className='message__form'>
        <Input
          fluid
          name='message'
          style={{ marginButtom : '0.7em' }}
          label={<Button icon='add' />}
          labelPosition='left'
          placeholder='Write your message'
          value={message}
          onChange={this.handleChange}
          onKeyDown={this.handleKeyDown}
          className={errors.some(error => error.message.includes('message')) ? 'error' : ''}
        />
        <Button.Group icon width='2'>
          <Button
            color='orange'
            content='Add Reply'
            labelPosition='left'
            icon='edit'
            onClick={this.sendMessage}
            disabled={loading}
          />
          <Button
            color='teal'
            disabled={uploadState === 'uploading'}
            onClick={this.openModal}
            content='Upload Media'
            labelPosition='right'
            icon='cloud upload'
          />
        </Button.Group>
        <FileModal 
            modal={modal} 
            closeModal={this.closeModal} 
            uploadFile={this.uploadFile}
          />
        <ProgressBar uploadState={uploadState} percentUploaded={percentUploaded} />
      </Segment>
    );
  }
}

export default MessageForm;