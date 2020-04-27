import React from 'react';
import Button from 'react-bootstrap/Button'
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import ListGroup from 'react-bootstrap/ListGroup'
import Popover from 'react-bootstrap/Popover'
import OverlayTrigger from 'react-bootstrap/OverlayTrigger'
import Table from 'react-bootstrap/Table'
class Status extends React.Component {
    constructor(props) {
        super(props);
        this.state = { apiResponse : [] };
    }

    callAPI() {
        fetch("http://192.168.1.218:9000/getDevices")
            .then(res => res.json())
            .then(res => this.setState({ apiResponse: res }))}

    componentDidMount() {
        this.callAPI();
    }

    render() {
        let listitems = this.state.apiResponse;

        console.log(listitems);

        return (
            <div>
                <h1>Device Status</h1>
                <hr>
                </hr>
                {/*<p className="App-intro">API Result: {this.state.apiResponse}</p>*/}
                <Container>
                    <ListGroup className="list-group">
                        {this.state.apiResponse.map(device => (
                            <DeviceEntry key={device.DeviceID} device={device} />
                            ))
                        }
                    </ListGroup>
                </Container>
                <hr/>
                {/*<p className="App-intro">API Result: {JSON.stringify(listitems)}</p>*/}
            </div>
        );
    }
}

class DeviceEntry extends React.Component {
    constructor(props){
        super(props);
        // this.getHeader = this.getHeader.bind(this);
        // this.getRowsData = this.getRowsData.bind(this);
        // this.getKeys = this.getKeys.bind(this);
        this.state = {
            deviceID : this.props.device.DeviceID,
            deviceChecked : false,
            available : false,
            data : [],
        }
    }

    componentDidMount() {
        this.CheckAvailable();
    }

    componentWillUnmount() {
        clearInterval(this.interval);
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (prevState.available !== this.state.available) {
            this.PingDevice();
            this.interval = setInterval(() => (this.CheckAvailable()), 3000);
            this.interval = setInterval(() => (this.PingDevice()), 3000);
        }
    }

    CheckAvailable() {
        fetch("http://192.168.1.218:9000/TCPServer", {
            headers: {
                'action': 'checkavailable',
                'device': this.state.deviceID
            }
        })
            .then(res => res.json())
            .then(res => this.setState({ available: res }))
            .then(() => this.setState({deviceChecked : true}));
    }

    PingDevice() {
        // this.setState({data : []});
        fetch("http://192.168.1.218:9000/TCPServer", {
            headers: {
                'action': 'pingdevice',
                'device': this.state.deviceID
            }
        })
            .then(res => res.json())
            .then(res => this.setState({ data: res }))
            .then(() => this.setState({deviceChecked : true}));
    }

    render() {
        return (
            <ListGroup.Item key={this.state.DeviceID}>
                <Row>
                    <Col className="text-center">
                        <h5 className="align-bottom">{this.props.device.FriendlyName}</h5>
                        {/*{this.props.device.DeviceID}*/}
                    </Col>
                    <Col className="text-center">


                        <OverlayTrigger
                            // trigger="click"
                            key={this.state.DeviceID}
                            delay={{ show: 250, hide: 400 }}
                            placement='right'
                            overlay={
                                <Popover id={`popover-positioned-right`}>
                                    <Popover.Title as="h3">Device Details</Popover.Title>
                                    <Popover.Content>
                                        <Table borderless xs hover>
                                            <tbody>
                                            <tr>
                                                <th>Mean Power:</th>
                                                <th>{this.state.data.PMean} W</th>
                                            </tr>

                                            <tr>
                                                <th>Volts:</th>
                                                <th>{this.state.data.Urms} Vrms</th>
                                            </tr>

                                            <tr>
                                                <th><>Frequency:</></th>
                                                <th>{this.state.data.Frequency} Hz</th>
                                            </tr>

                                            <tr>
                                                <th><>Power Factor:</></th>
                                                <th>{this.state.data.PowerFactor}</th>
                                            </tr>
                                            </tbody>
                                        </Table>
                                        This data updates every 3 seconds.
                                    </Popover.Content>
                                </Popover>
                            }
                        >
                            <Button variant={this.state.available ? 'outline-primary' : 'outline-danger'} disabled={!this.state.available}>
                                {(this.state.data.PMean === undefined) ? (this.state.available) ? 'Loading...' : 'N/A' : parseInt(this.state.data.PMean) + ' W'}
                            </Button>
                        </OverlayTrigger>{' '}
                    </Col>
                    <Col className="text-center">
                        <Button

                            variant={(this.state.deviceChecked) ? (this.state.available) ? 'success' : 'outline-danger' : 'warning'}>
                            {(this.state.deviceChecked) ? (this.state.available) ? 'Online' : 'Offline' : 'Loading'}
                        </Button>
                    </Col>
                </Row>
            </ListGroup.Item>

        );
    }
}

export default Status;