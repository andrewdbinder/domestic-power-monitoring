import React, { useState } from 'react';
import logo from "../ScaryJD.png";
import Button from 'react-bootstrap/Button'
import Alert from 'react-bootstrap/Alert'

import ButtonToolbar from 'react-bootstrap/ButtonToolbar'
class home extends React.Component {
    constructor(props) {
        super(props);
        this.state = { apiResponse : '' };
        this.sayHello = this.callAPI.bind(this);
    }

    callAPI(header) {
        fetch("http://192.168.1.218:9000/testTCP", {
            headers: {
                data: header
            }
        })
            .then(res => res.text())
            .then(res => this.setState({ apiResponse: res }));
    }

    componentWillMount() {
        // this.callAPI('2');
    }

    AlertDismissibleExample() {
        const [show, setShow] = useState(false);

        if (show) {
            return (
                <Alert variant="danger" onClose={() => setShow(false)} dismissible>
                    <Alert.Heading>FRICK YOU YOU CAN'T DO THAT</Alert.Heading>
                    {/*<p>*/}
                    {/*    Change this and that and try again. Duis mollis, est non commodo*/}
                    {/*    luctus, nisi erat porttitor ligula, eget lacinia odio sem nec elit.*/}
                    {/*    Cras mattis consectetur purus sit amet fermentum.*/}
                    {/*</p>*/}
                </Alert>
            );
        }
        return <Button onClick={() => setShow(true)}>Send '3'</Button>;
    }


    render() {
        return (
            <div>
                <h1>Home</h1>
                <hr/>
                <p>Home page body content</p>
                <img src={logo} className="App-logo" alt="logo"/>
                <hr/>
                <span>&nbsp;&nbsp;</span>
                <span>&nbsp;&nbsp;</span>
                <span>&nbsp;&nbsp;</span>
                <span>&nbsp;&nbsp;</span>
                {/*<ButtonToolbar>*/}
                    <Button
                        onClick={() => this.callAPI('0')}>Send '0'</Button>
                    {'  '}
                <Button
                    onClick={() => this.callAPI('2')}>Send '2'</Button>
                {'  '}
                <this.AlertDismissibleExample/>
                {/*</ButtonToolbar>*/}

                    <h3 className="App-intro">API Result: {JSON.stringify(this.state.apiResponse)}</h3>

            </div>
        );
    };
};

export default home;
