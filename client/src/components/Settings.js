import React from 'react';
import Button from 'react-bootstrap/Button'
import ButtonGroup from 'react-bootstrap/ButtonGroup'
import Dropdown from 'react-bootstrap/Dropdown'
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Form from 'react-bootstrap/Form'
import ListGroup from 'react-bootstrap/ListGroup'
import Modal from 'react-bootstrap/Modal'



// const About = () => {
class Settings extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
                        dbDeviceState : [],
                        newDeviceState : [],
                        changes: false,
                        isLoading: false,
                        modifyresult: []};
        this.UpdateTable = this.UpdateTable.bind(this);
        this.modifyTable = this.modifyTable.bind(this);
    }

    getDevices() {
        fetch("http://192.168.1.218:9000/getDevices", {
            headers: {
                'active': 'all',
            }
        })
            .then(res => res.json())
            .then(res => this.setState({ dbDeviceState: res }));
    }

    modifyTable(e) {
        this.setState( {changes: false });
        for (const device of this.state.dbDeviceState) {
            if (device.newActive !== device.selected) {
                fetch("http://192.168.1.218:9000/manageDevices", {
                    headers: {
                        'action': 'changeactive',
                        'deviceid': device.DeviceID,
                        'active': device.newActive
                    }
                })
                    .then(res => res.json())
                    .then(res => this.setState({result: res}))
                    .then((res) => {
                        console.log(res);
                        this.UpdateTable(e);
                    });
            }
        }
        // this.handleClose();

    }

    componentDidMount() {
        this.getDevices();
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (this.state.dbDeviceState !== prevState.dbDeviceState) {
            this.createNewDeviceState();
        }
    }

    createNewDeviceState() {
        let newstate = this.state;
        for (const device of newstate.dbDeviceState) {
            device.active = Boolean(device.active);
            if (!device.hasOwnProperty('modified') || !device.modified) {
                device.modified = false;
                device.newActive = device.active;
                if (device.active) {
                    device.variant = 'success'
                } else {
                    device.variant = 'secondary'
                }
            }
        }

        this.setState({newstate});
    }

    determineChanges() {
        let newstate = this.state;
        newstate.changes = false;

        for (const device of newstate.dbDeviceState) {
            if (device.selected !== device.newActive) {
                newstate.changes = true;
            }
        }

        this.createNewDeviceState();
        this.setState({newstate});
    }

    handleClick(deviceID) {
        // e.preventDefault();

        // console.log(deviceID);

        for (const device of this.state.dbDeviceState) {
            if (device.DeviceID === deviceID) {
                device.newActive = !device.newActive;
                device.modified = !device.modified;

                if (device.newActive !== device.selected) {
                    device.modified = true;
                    device.variant = 'warning'
                } else {
                    device.modified = false;
                }
                console.log(device)

                console.log('toggling')
            }
        }

        this.determineChanges();
    }

    UpdateTable(e) {
        e.preventDefault();
        this.getDevices();
    }

    render() {
        return (
            <div>
                <h1>System Settings</h1>
                <hr/>
                <h3>Manage Current Devices</h3>
                <Container>
                    <ListGroup className="list-group">
                        <TableOutput UpdateTable={this.UpdateTable} data={this.state.dbDeviceState} handleClick={deviceID => this.handleClick(deviceID)} />
                        <ListGroup.Item>
                            <Col className="text-center">
                                <Button block onClick={this.modifyTable} disabled={!this.state.changes} variant='primary'>
                                    Save Changes
                                </Button>
                            </Col>
                        </ListGroup.Item>
                    </ListGroup>
                    <h3 className="mt-5">New Device</h3>

                    <ListGroup className="list-group">
                        <ListGroup.Item >
                            <AddDevice UpdateTable={this.UpdateTable}/>
                        </ListGroup.Item>
                    </ListGroup>
                </Container>


                {/*<p className="App-intro">API Result: {JSON.stringify(listitems)}</p>*/}
            </div>
        );
    }
}

class DeleteDevice extends React.Component {
    constructor(props){
        super(props);

        this.state = {
            show : false,
            setShow : false,
            isLoading : false,
            result : []};
        this.Delete = this.Delete.bind(this);
    }


    handleClose = () => this.setState({show: false});
    handleShow = () => this.setState({show: true});

    Delete(e, device) {
        e.preventDefault();
        this.setState( {isLoading: true });
        fetch("http://192.168.1.218:9000/manageDevices", {
            headers:  {
                'action': 'delete',
                'device': device
            }
        })
            .then(res => res.json())
            .then(res => this.setState({ result: res }))
            .then((res) => {
                console.log(res);
                this.handleClose();
                this.props.UpdateTable(e);
            });

        console.log(e)
    }

    render() {
        return (
            <>
                <Dropdown.Item /*variant="danger"*/ onClick={this.handleShow}>
                    Delete
                </Dropdown.Item>

                <Modal show={this.state.show} onHide={this.handleClose} aria-labelledby="contained-modal-title-vcenter"
                       centered>
                    <Modal.Header closeButton>
                        <Modal.Title>Confirm Delete</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        Are you sure you want to delete <b>{this.props.FriendlyName}</b>?
                        <br/>
                        This action will <i>not</i> remove data with device ID <b>{this.props.DeviceID}</b>.
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={this.handleClose}>
                            Cancel
                        </Button>
                        <Button variant="danger" disabled={this.state.isLoading} onClick={e => this.Delete(e, this.props.DeviceID)} >
                            {this.state.isLoading ? 'Deleting…' : 'Delete'}
                        </Button>
                    </Modal.Footer>
                </Modal>
            </>
        )
    }
}

class AddDevice extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            validated : false,
            deviceName : '',
            deviceID : '',
            result : []
        };
        this.handleSubmit = this.handleSubmit.bind(this);

    }

    handleSubmit(e) {
        console.log(this.state);
        e.preventDefault();
        e.stopPropagation();
        this.setValidated();

        if(this.state.deviceID !== '' && this.state.deviceName !== '') {
            this.addDevice(e, this.state.deviceID, this.state.deviceName);
            document.getElementById("newDevice").reset();
            this.setState({validated: false})
        }

    };

    addDevice(e, deviceID, deviceName) {
        this.setState( {isLoading: true });
        fetch("http://192.168.1.218:9000/manageDevices", {
            headers:  {
                'action': 'insert',
                'deviceid': deviceID,
                'devicename': deviceName,
            }
        })
            .then(res => res.json())
            .then(res => this.setState({ result: res }))
            .then((res) => {
                this.props.UpdateTable(e);
            });

        this.forceUpdate();
    }

    onChange = (e) => {
        this.setState({ [e.target.name]: e.target.value });
    };



    // validated = () => this.setState({show: this.state.show = false});
    setValidated = () => this.setState({validated: true});

    render() {
        return (
            <Form noValidate id="newDevice" validated={this.state.validated} onSubmit={this.handleSubmit}>
                <Form.Row>
                    <Form.Group as={Col} md="4" controlId="validationCustom01">
                        {/*<Form.Label>Device Name</Form.Label>*/}
                        <Form.Control
                            required
                            size="lg"
                            type="text"
                            name="deviceName"
                            onChange={e => this.onChange(e)}
                            placeholder="Device Name"
                        />
                        <Form.Control.Feedback type="valid">Looks good!</Form.Control.Feedback>
                        <Form.Control.Feedback type="invalid">
                            Please provide a valid device name.
                        </Form.Control.Feedback>
                    </Form.Group>
                    <Form.Group as={Col} md="4" controlId="validationCustom02">
                        {/*<Form.Label>Device ID</Form.Label>*/}
                        <Form.Control
                            required
                            size="lg"
                            type="text"
                            name="deviceID"
                            onChange={e => this.onChange(e)}
                            placeholder="Device ID"
                        />
                        <Form.Control.Feedback type="valid">Looks good!</Form.Control.Feedback>
                        <Form.Control.Feedback type="invalid">
                            Please provide a valid device ID.
                        </Form.Control.Feedback>
                    </Form.Group>
                    <Form.Group as={Col} md="4">
                        {/*<Form.Label>Submit</Form.Label>*/}
                        <Button size="lg" type="submit">Add Device</Button>
                    </Form.Group>
                </Form.Row>
            </Form>
        );
    }
}

class TableOutput extends React.Component {
    render() {
        return (
            this.props.data.map(listitem => (
                <ListGroup.Item key={listitem.DeviceID}>
                     <Row>
                         <Col className="text-center">
                             <h5>{listitem.FriendlyName}</h5>
                         </Col>
                         <Col className="text-center">
                             <h5>{listitem.DeviceID}</h5>
                         </Col>
                        <Col className="text-center">

                                <Dropdown as={ButtonGroup}>
                                    <Button
                                        variant={listitem.variant}
                                        onClick = { () => { this.props.handleClick(listitem.DeviceID) } }>
                                        {(listitem.modified) ? (listitem.newActive) ? 'Enable' : 'Disable' : (listitem.active) ?  'Enabled' : 'Disabled'}
                                    </Button>

                                    <Dropdown.Toggle split variant={listitem.variant} id="dropdown-split-basic" />

                                    <Dropdown.Menu>
                                        <DeleteDevice UpdateTable={e => this.props.UpdateTable(e)} FriendlyName={listitem.FriendlyName} DeviceID={listitem.DeviceID}/>
                                    </Dropdown.Menu>
                                </Dropdown>

                        </Col>
                    </Row>
                </ListGroup.Item>
            ))
        );
    }
}

export default Settings;