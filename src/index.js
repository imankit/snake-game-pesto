import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import Snake from './Snake';
import { Container, Header } from 'semantic-ui-react';
import * as serviceWorker from './serviceWorker';

ReactDOM.render(
  <Container style={{ margin: 20 }}>
    <Header as="h1" textAlign="center">
      Snake Game
    </Header>
    <Snake />
  </Container>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
