import React  from 'react';
import logo from "../ScaryJD.png";
import Button from 'react-bootstrap/Button'

class home extends React.Component {
    constructor(props) {
        super(props);
        this.state = { apiResponse : [] };
        this.sayHello = this.callAPI.bind(this);
    }

    callAPI(header) {
        fetch("http://192.168.1.218:9000/testTCP", {
            headers: {
                data: header
            }
        })
            .then(res => res.json())
            .then(res => this.setState({ apiResponse: res }));
    }

    componentDidUpdate() {
        console.log(this.state.apiResponse);
    }


    render() {
        return (
            <div>
                <h1>Home</h1>
                <hr/>
                <p>Home page body content</p>
                <img src={logo} className="App-logo" alt="logo"/>
                <hr className='mt-5'/>
                    <Button
                        onClick={() => this.callAPI('0')}>Send '0'</Button>
                    {'  '}
                <Button
                    onClick={() => this.callAPI('2')}>Send '2'</Button>

                    <h3 className="App-intro">API Result: {JSON.stringify(this.state.apiResponse)}</h3>

            </div>
        );
    };
};

export default home;
