import React from 'react';
import logo from './logo.svg';
import './App.css';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import Navigation from './components/Navigation';
import Home from './components/Home';
import Status from './components/Status';
import History from './components/History'
import Navbar from 'react-bootstrap/Navbar'
import Container from "react-bootstrap/Container";
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Nav from 'react-bootstrap/Navbar'

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = { apiResponse: "" };
  }

  callAPI() {
    fetch("http://172.18.70.4:9000/testAPI")
        .then(res => res.text())
        .then(res => this.setState({ apiResponse: res }));
  }

  componentWillMount() {
    this.callAPI();
  }

  render() {
    return (
        <div className="App">

          <BrowserRouter>
            <div>
              <Navigation />
              <Switch>
                <Route path="/" component={Home} exact/>
                <Route path="/status" component={Status}/>
                <Route path="/history" component={History}/>
                {/*<Route path="/contact" component={Contact}/>*/}
                <Route component={Error}/>
              </Switch>
            </div>
          </BrowserRouter>
          {/*<header className="App-header">*/}

          {/*<img src={logo} className="App-logo" alt="logo"/>*/}
          {/*  <p>*/}
          {/*    Edit <code>src/App.js</code> and save to reload.*/}
          {/*  </p>*/}
          {/*  <a*/}
          {/*      className="App-link"*/}
          {/*      href="https://reactjs.org"*/}
          {/*      target="_blank"*/}
          {/*      rel="noopener noreferrer"*/}
          {/*  >*/}
          {/*    Learn React*/}
          {/*  </a>*/}
          {/*  <p className="App-intro">API Result: {this.state.apiResponse}</p>*/}
          {/*</header>*/}
        </div>



    );
  }
}

export default App;
