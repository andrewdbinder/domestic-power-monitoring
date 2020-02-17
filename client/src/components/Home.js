import React from 'react';
import logo from "../ScaryJD.png";

class home extends React.Component {
    constructor(props) {
        super(props);
        this.state = { apiResponse : '' };
    }

    callAPI() {
        fetch("http://172.18.70.4:9000/testTCP")
            .then(res => res.text())
            .then(res => this.setState({ apiResponse: res }));
    }

    componentWillMount() {
        this.callAPI();
    }

    render() {
        return (
            <div>
                <h1>Home</h1>
                <p>Home page body content</p>
                <img src={logo} className="App-logo" alt="logo"/>
                <p className="App-intro">API Result: {JSON.stringify(this.state.apiResponse)}</p>

            </div>
        );
    };
};

export default home;
