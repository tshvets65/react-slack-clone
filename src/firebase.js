import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/database';
import 'firebase/storage';

var config = {
  apiKey: "AIzaSyDWBFxMX82CVDHPFMP7QORl1uOS1H7dpCY",
  authDomain: "react-slack-clone-389d4.firebaseapp.com",
  databaseURL: "https://react-slack-clone-389d4.firebaseio.com",
  projectId: "react-slack-clone-389d4",
  storageBucket: "react-slack-clone-389d4.appspot.com",
  messagingSenderId: "1001952604752"
};
firebase.initializeApp(config);

export default firebase;