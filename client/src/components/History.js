import React from 'react';
import logo from "../masoon.png";



class history extends React.Component {
    constructor(props) {
        super(props);
        this.state = { apiResponse : [] };
    }

    callAPI() {
        fetch("http://172.18.70.4:9000/testAPI")
            .then(res => res.json())
            .then(res => this.setState({ apiResponse: res }));
    }

    componentWillMount() {
        this.callAPI();
    }

    render() {
        return (
            <div>
                <h1>Usage History</h1>
                <p>Home page body content</p>
                <img src={logo} className="App-logo" alt="logo"/>
            </div>
        );
    };
};

export default history;
