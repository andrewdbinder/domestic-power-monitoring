import React, { useState } from 'react';
import Button from 'react-bootstrap/Button'
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import ListGroup from 'react-bootstrap/ListGroup'
// import Alert from 'react-bootstrap/Alert'


// const About = () => {
class Status extends React.Component {
    constructor(props) {
        super(props);
        this.state = { apiResponse : [] };
    }

    callAPI() {
        fetch("http://192.168.1.218:9000/getDevices")
            .then(res => res.json())
            .then(res => this.setState({ apiResponse: res }));
    }

    componentWillMount() {
        this.callAPI();
    }


    render() {
        let listitems = this.state.apiResponse;

        console.log(listitems);

        // let listitemsarray = Object.values(this.state.apiResponse);

        // console.log(listitemsarray);

        return (
            <div>
                <h1>Device Status</h1>
                <hr>
                </hr>
                {/*<p className="App-intro">API Result: {this.state.apiResponse}</p>*/}
                <TableOutput data={this.state.apiResponse} />
                <hr></hr>
                <i className="fas fa-camera fa-xs"></i>

                {/*<p className="App-intro">API Result: {JSON.stringify(listitems)}</p>*/}
            </div>
        );
    }
}


class TableOutput extends React.Component {
    constructor(props){
        super(props);
        // this.getHeader = this.getHeader.bind(this);
        // this.getRowsData = this.getRowsData.bind(this);
        // this.getKeys = this.getKeys.bind(this);
    }




    render() {
        return (
            <React.Fragment>
                <Container>
                    <ListGroup className="list-group">
                        {this.props.data.map(listitem => (
                            <ListGroup.Item key={listitem.DeviceID}>
                                 <Row>
                                     <Col className="text-center">
                                         <h5>{listitem.FriendlyName}</h5>
                                     </Col>
                                    <Col className="text-center">
                                        <Button variant='warning'>
                                            {listitem.usage !== -1 && listitem.usage}
                                            {(listitem.usage === -1) ? 'Loading...' : ' 600 W'}
                                        </Button>
                                    </Col>
                                    <Col className="text-center">
                                        <Button
                                            variant={(listitem.status === "Online") ? 'success' : 'success'}>
                                            {listitem.status} Online
                                        </Button>
                                    </Col>
                                </Row>
                            </ListGroup.Item>
                        ))}
                    </ListGroup>
                </Container>
            </React.Fragment>
        );

        // return (
        //     <div>
        //         {this.props.data.map()}
        //     </div>
        // );
    }
}

export default Status;