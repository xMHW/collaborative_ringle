import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';

// import Card from './components/Card2'
import reportWebVitals from './reportWebVitals';
import {
  BrowserRouter as Router,
  Route,
  Switch,
} from 'react-router-dom';

ReactDOM.render(
  <React.StrictMode>
    <Router basename={`/${process.env.PUBLIC_URL}`}>
      <Switch>
        <Route exact path="/:userId" component={App}/>
      </Switch>
    </Router>
  </React.StrictMode>,
  document.getElementById('root')
  );
  
  // <Route exact path="/" component={App}/>
// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
