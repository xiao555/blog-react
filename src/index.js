import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import 'highlight.js/styles/dark.css'
import App from './App';
import * as serviceWorker from './serviceWorker';
import event from 'utils/event'
// Register AV objects to the global
window.AV = require('leancloud-storage');

ReactDOM.render(<App />, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.register({
  onUpdate (registration) {
    event.emit('sw-update', registration)
  }
});

window.addEventListener('unhandledrejection', (e) => {
  e.preventDefault()
  e.promise.catch(err => console.log(err))
})