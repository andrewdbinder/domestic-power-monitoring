import React from 'react';
import './App.css';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import Navigation from './components/Navigation';
import Status from './components/Status';
import History from './components/History'
import Settings from './components/Settings';
import { withRouter } from "react-router";


const NavigationWithRouter = withRouter(Navigation);

// Main call for website
class App extends React.Component {
  componentDidMount() {
    document.title = "Power Monitor"
  }

  render() {
    return (
        <div className="App">
          <BrowserRouter>
            <div>
              <NavigationWithRouter />
              <Switch>
                <Route path="/" component={Status} exact/>
                <Route path="/status" component={Status}/>
                <Route path="/history" component={History}/>
                <Route path="/settings" component={Settings}/>
                <Route component={Status}/>
              </Switch>
            </div>
          </BrowserRouter>
        </div>
    );
  }
}

export default App;
