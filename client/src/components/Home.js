import React from 'react';
import logo from "../gary.png";

const home = () => {
    return (
        <div>
            <h1>Home</h1>
            <p>Home page body content</p>
            <img src={logo} className="App-logo" alt="logo"/>
        </div>
    );
};

export default home;
