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
import config from '../config.json'

// Main Module definition
class Settings extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            dbDeviceState : [],
            changes: false,
            isLoading: false};
        this.UpdateTable = this.UpdateTable.bind(this);
        this.modifyTable = this.modifyTable.bind(this);
    }

    // When page loads, request list of all devices
    componentDidMount() {
        this.getDevices();
    }

    // On page update, check of the state of the db has changes re: active devices
    componentDidUpdate(prevProps, prevState, snapshot) {
        if (this.state.dbDeviceState !== prevState.dbDeviceState) {
            this.createNewDeviceState();
        }
    }

    // Make HTTP request to back-end db, update state
    getDevices() {
        fetch("http://" + config.API.HOST + ":" + config.API.PORT + "/getDevices", {
            headers: {
                'active': 'all',
            }
        })
            .then(res => res.json())
            .then(res => this.setState({ dbDeviceState: res }));
    }

    // Make change to active state of devices when save changes button is pressed
    modifyTable(e) {
        // Disable save changes button
        this.setState( {changes: false });

        // Logic to search for changed devices and save the changes
        for (const device of this.state.dbDeviceState) {
            if (device.newActive !== device.selected) {
                fetch("http://" + config.API.HOST + ":" + config.API.PORT + "/manageDevices", {
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
                        // After device successfully toggles, update the table
                        this.UpdateTable(e);
                    });
            }
        }
    }

    // Creates some additional fields from db response containing theme variants and modified tag
    createNewDeviceState() {
        // Make copy of state
        let newstate = this.state;

        // Setup every device from the database response
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

        // Update state of instance
        this.setState({newstate});
    }

    // Check if save changes button should be enabled
    determineChanges() {
        let newstate = this.state;
        newstate.changes = false;

        for (const device of newstate.dbDeviceState) {
            if (device.selected !== device.newActive) {
                newstate.changes = true;
            }
        }

        // Rerun state setup
        this.createNewDeviceState();
        this.setState({newstate});
    }

    // Handle toggling devices theme variant and new state
    handleClick(deviceID) {
        // Find device in table
        for (const device of this.state.dbDeviceState) {
            // Once it's found, toggle the newActive and modified fields
            if (device.DeviceID === deviceID) {
                device.newActive = !device.newActive;
                device.modified = !device.modified;

                // Update variants
                if (device.newActive !== device.selected) {
                    device.modified = true;
                    device.variant = 'warning'
                } else {
                    device.modified = false;
                }
            }
        }

        // Handle additional theme and state changes
        this.determineChanges();
    }

    // Reload the table from scratch from the database
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
                        <TableOutput
                            UpdateTable={this.UpdateTable}
                            data={this.state.dbDeviceState}
                            handleClick={deviceID => this.handleClick(deviceID)}
                        />
                        <ListGroup.Item>
                            <Col className="text-center">
                                <Button
                                    block
                                    onClick={this.modifyTable}
                                    disabled={!this.state.changes}
                                    variant='primary'
                                >
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
            </div>
        );
    }
}

// Output Table of database results, combined with user modification components
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
                                    onClick = { () => { this.props.handleClick(listitem.DeviceID) } }
                                >
                                    {/* Logic to determine button label */}
                                    {(listitem.modified) ? (listitem.newActive) ? 'Enable' : 'Disable' :
                                        (listitem.active) ?  'Enabled' : 'Disabled'}
                                </Button>

                                <Dropdown.Toggle
                                    split
                                    variant={listitem.variant}
                                    id="dropdown-split-basic"
                                />

                                <Dropdown.Menu>
                                    {/* Pass appropriate methods and names to delete device */}
                                    <DeleteDevice
                                        UpdateTable={e => this.props.UpdateTable(e)}
                                        FriendlyName={listitem.FriendlyName}
                                        DeviceID={listitem.DeviceID}
                                    />
                                </Dropdown.Menu>
                            </Dropdown>
                        </Col>
                    </Row>
                </ListGroup.Item>
            ))
        );
    }
}

// Handle delete buttons, we want a delete device confirmation
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

    // Handle state for popup of Modal
    handleClose = () => this.setState({show: false});
    handleShow = () => this.setState({show: true});

    // Back-end call to remove device from device table
    Delete(e, device) {
        e.preventDefault();

        // Disable button after first click
        this.setState( {isLoading: true });

        // Make Request to backend
        fetch("http://" + config.API.HOST + ":" + config.API.PORT + "/manageDevices", {
            headers:  {
                'action': 'delete',
                'device': device
            }
        })
            .then(res => res.json())
            .then(res => this.setState({ result: res }))
            .then(() => {
                // On successful response, close popup and update parent's table
                this.handleClose();
                this.props.UpdateTable(e);
            });
    }

    render() {
        return (
            <>
                <Dropdown.Item onClick={this.handleShow}>
                    Delete
                </Dropdown.Item>

                <Modal
                    show={this.state.show}
                    onHide={this.handleClose}
                    aria-labelledby="contained-modal-title-vcenter"
                    centered
                >
                    <Modal.Header closeButton>
                        <Modal.Title>Confirm Delete</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        Are you sure you want to delete <b>{this.props.FriendlyName}</b>?
                        <br/>
                        This action will <i>not</i> remove data associated with device <b>{this.props.DeviceID}</b>.
                    </Modal.Body>
                    <Modal.Footer>
                        <Button
                            variant="secondary"
                            onClick={this.handleClose}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="danger"
                            disabled={this.state.isLoading}
                            onClick={e => this.Delete(e, this.props.DeviceID)}
                        >
                            {this.state.isLoading ? 'Deleting…' : 'Delete'}
                        </Button>
                    </Modal.Footer>
                </Modal>
            </>
        )
    }
}

// Component to handle adding a new device
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

    // Backend call to add device to database
    addDevice(e, deviceID, deviceName) {
        this.setState( {isLoading: true });
        fetch("http://" + config.API.HOST + ":" + config.API.PORT + "/manageDevices", {
            headers:  {
                'action': 'insert',
                'deviceid': deviceID,
                'devicename': deviceName,
            }
        })
            .then(res => res.json())
            .then(res => this.setState({ result: res }))
            .then(() => {
                // Update parent's table after response
                this.props.UpdateTable(e);
            });
    }

    // Handle submission button press
    handleSubmit(e) {
        e.preventDefault();
        e.stopPropagation();
        this.setValidated();

        // Make sure fields aren't empty, then make request and reset form
        if(this.state.deviceID !== '' && this.state.deviceName !== '') {
            this.addDevice(e, this.state.deviceID, this.state.deviceName);
            document.getElementById("newDevice").reset();
            this.setState({validated: false})
        }

    };

    // Keep temp variables updated with text box values
    onChange = (e) => {
        this.setState({ [e.target.name]: e.target.value });
    };

    // Set form validation
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
                        <Button size="lg" type="submit">Add Device</Button>
                    </Form.Group>
                </Form.Row>
            </Form>
        );
    }
}

export default Settings;