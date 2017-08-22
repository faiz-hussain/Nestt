import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import registerServiceWorker from './registerServiceWorker';
import {
  withGoogleMap,
  GoogleMap,
} from  "../node_modules/react-google-maps/lib";


ReactDOM.render(<App />, document.getElementById('root'));
registerServiceWorker();
