import React from 'react';
import { Line } from 'react-chartjs-2';
import Container from 'react-bootstrap/Container'
import Dropdown from 'react-bootstrap/Dropdown'
import DatePicker from "react-datepicker"
import Button from 'react-bootstrap/Button'
import ButtonGroup from 'react-bootstrap/ButtonGroup'
import ButtonToolbar from 'react-bootstrap/ButtonToolbar'
import InputGroup from 'react-bootstrap/InputGroup'
import config from '../config.json'

// Import distributed CSS
import "react-datepicker/dist/react-datepicker.css"
// Custom CSS Import
import './react-datepicker.css'

// Main function to handle history searching
class history extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            graphData : [],
            devices : [],
            friendlyName: [{"FriendlyName": "undefined"}],
            startDate: new Date(),
            endDate: new Date(),
            minTime: new Date()};

        // Configure datetime extreme values
        this.state.startDate.setDate(this.state.startDate.getDate() - 1);
        this.state.minTime.setHours(0);
        this.state.minTime.setMinutes(0);
        this.state.minTime.setTime(0);

        this.handleClick = this.handleClick.bind(this);
    }

    // On page load, get device list
    componentDidMount() {
        this.callDevices();
    }

    // Back-end call to get friendly name of device for the graph
    getFriendlyName(device) {
        fetch("http://" + config.API.HOST + ":" + config.API.PORT + "/getFriendlyName", {
            headers:  {
                'device': device
            }
        })
            .then(res => res.json())
            .then(res => this.setState({ friendlyName: res }));
    }

    // Back-end call to get actual graph data
    getGraphData(devices) {
        console.log(this.state.startDate.toJSON());
        console.log(this.state.startDate.toLocaleDateString());
        fetch("http://" + config.API.HOST + ":" + config.API.PORT + "/testAPI", {
            headers:  {
                'startdate': this.state.startDate.toISOString(),
                'enddate': this.state.endDate.toISOString(),
                'devices': devices
            }
        })
            .then(res => res.json())
            .then(res => this.setState({ graphData: res }));
    }

    // Back-end call to get list of devices
    callDevices() {
        fetch("http://" + config.API.HOST + ":" + config.API.PORT + "/getDevices")
            .then(res => res.json())
            .then(res => this.setState({ devices: res }));
    }

    // Handle press of dropdown item
    ToggleSearch(DeviceID) {
        let newstate = this.state;

        // determine if a device is selected
        for (const device of newstate.devices) {
            device.selected = device.DeviceID === DeviceID;
        }

        this.getFriendlyName(DeviceID);

        let activeDevices = [];
        // Push selected device to activeDevices array
        for (const device of this.state.devices) {
            if (device.selected === true) {
                activeDevices.push(device.DeviceID);
            }
        }

        // Get graph data for selected devices
        this.getGraphData(activeDevices);

        this.setState({newstate});
    }

    // Handle Search Button Press
    handleClick(e) {
        e.preventDefault();
        let testDevices = [];

        for (const device of this.state.devices) {
            if (device.selected === true) {
                testDevices.push(device.DeviceID);
            }
        }

        this.getGraphData(testDevices);
    }

    handleStartChange = date => {
        this.setState({
            startDate: date
        });
    };

    handleEndChange = date => {
        this.setState({
            endDate: date
        });
    };

    render() {
        // Chart configuration
        let response = this.state.graphData;

        let labels = response.map(function(e) {
            return e.MeasurementTime;
        });

        let data = response.map(function(e) {
            return e.WattValue;
        });

        let chart = {
            labels: labels,
            datasets: [
                {
                    fill: true,
                    lineTension: 0.1,
                    backgroundColor: 'rgba(0,133,255,0.56)',
                    borderColor: '#007bff',
                    borderCapStyle: 'butt',
                    borderDash: [],
                    borderDashOffset: 0.0,
                    borderJoinStyle: 'miter',
                    pointBorderColor: '#007bff',
                    pointBackgroundColor: '#fff',
                    pointBorderWidth: 1,
                    pointHoverRadius: 5,
                    pointHoverBackgroundColor: '#007bff',
                    pointHoverBorderColor: 'rgba(220,220,220,1)',
                    pointHoverBorderWidth: 2,
                    pointRadius: 1,
                    pointHitRadius: 10,
                    data: data
                }
            ],
        };

        const options = {
            legend: {
                display: false,
                position: 'bottom'
            },
            scales: {
                xAxes: [{
                    // stacked: true,
                    ticks: {
                        min: 0,
                        maxTicksLimit: 20
                    },
                    type: 'time',
                    time: {
                        // parser: 'MM/DD/YYYY HH:mm',
                        tooltipFormat: 'll hh:mm A',
                        unit: 'hour',
                        unitStepSize: 0.5,
                        displayFormats: {
                            'day': 'MM/DD/YYYY',
                            'hour': 'hh:mm A'
                        }
                    },
                }],
                yAxes: [{
                    ticks: {
                        beginAtZero: true,
                        callback: function(value) {
                            return value + " W";
                        }
                    }
                }],

            }
        };

        // If a device has been searched, enable and assign a value to the label
        if (this.state.friendlyName[0].FriendlyName !== 'undefined') {
            chart.datasets[0].label = this.state.friendlyName[0].FriendlyName;
            options.legend.display = true;
        }

        return (
            <div>
                <h1>Usage History</h1>
                <hr/>
                <ButtonToolbar style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <CalendarSearch startDate = { this.state.startDate }
                                    endDate = { this.state.endDate }
                                    minTime = { this.state.minTime }
                                    handleStartChange = {e => this.handleStartChange(e) }
                                    handleEndChange = {e => this.handleEndChange(e) }
                    />

                    <Dropdown className='ml-3' as={ButtonGroup}>
                        <Button variant="light" onClick={this.handleClick}>Search</Button>
                        <Dropdown.Toggle split variant="light" id="dropdown-split-basic" />
                        <Dropdown.Menu>
                            {this.state.devices.map(device =>
                                <Dropdown.Item
                                    active = { device.selected }
                                    key = { device.DeviceID }
                                    onClick = { () => { this.ToggleSearch(device.DeviceID) } }
                                >
                                    { device.FriendlyName }
                                </Dropdown.Item>
                            )}
                        </Dropdown.Menu>
                    </Dropdown>
                </ButtonToolbar>
                <Container>
                    <Line data={chart} options={options}/>
                </Container>
                <hr/>
            </div>
        );
    };
}

// Handle calendar dropdowns for date range searches
class CalendarSearch extends React.Component {
    render() {
        return (
            <>
                <ButtonGroup className="mr-lg-3 ">

                    <InputGroup.Prepend>
                        <InputGroup.Text id="btnGroupAddon">Start: </InputGroup.Text>
                    </InputGroup.Prepend>
                    <DatePicker
                        selected={this.props.startDate}
                        onChange={date => this.props.handleStartChange(date)}
                        selectsStart
                        startDate={this.props.startDate}
                        endDate={this.props.endDate}
                        maxDate={this.props.endDate}
                        minTime={this.props.minTime}
                        maxTime={this.props.endDate}
                        dateFormat="MMMM d, yyyy h:mm aa"
                    />
                </ButtonGroup>
                <ButtonGroup className="my-3 ">
                    <InputGroup.Prepend>
                        <InputGroup.Text id="btnGroupAddon">End:</InputGroup.Text>
                    </InputGroup.Prepend>
                    <DatePicker
                        selected={this.props.endDate}
                        onChange={date => this.props.handleEndChange(date)}
                        selectsEnd
                        startDate={this.props.startDate}
                        endDate={this.props.endDate}
                        minDate={this.props.startDate}
                        maxDate={new Date()}
                        maxTime={new Date()}
                        minTime={this.props.startDate}
                        dateFormat="MMMM d, yyyy h:mm aa"
                    />
                </ButtonGroup>
            </>
        );
    }
}

export default history;
