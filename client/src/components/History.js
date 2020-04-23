import React from 'react';
// import logo from "../masoon.png";
import { Line } from 'react-chartjs-2';
import Container from 'react-bootstrap/Container'
// import DropdownButton from 'react-bootstrap/DropdownButton'
// import DropdownItem from 'react-bootstrap/DropdownItem'
import Dropdown from 'react-bootstrap/Dropdown'
// import Row from 'react-bootstrap/Row'
// import Col from 'react-bootstrap/Col'
import DatePicker from "react-datepicker";
import Button from 'react-bootstrap/Button'
import ButtonGroup from 'react-bootstrap/ButtonGroup'
import ButtonToolbar from 'react-bootstrap/ButtonToolbar'
import InputGroup from 'react-bootstrap/InputGroup'
// import FormControl from 'react-bootstrap/FormControl'
// import Form from 'react-bootstrap/Form'
import "react-datepicker/dist/react-datepicker.css"
import './react-datepicker.css'
// import 'react-datepicker/dist/react-datepicker-cssmodules.css'
// import moment from "moment";

class CalendarSearch extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
                    <ButtonGroup>
                        <InputGroup>

                            <InputGroup.Prepend>
                                <InputGroup.Text id="btnGroupAddon">Start: </InputGroup.Text>
                            </InputGroup.Prepend>
                            {/*<FormControl type="datetime-local" value={this.props.startDate.toLocaleString()}/>*/}
                            <DatePicker
                                selected={this.props.startDate}
                                onChange={date => this.props.handleStartChange(date)}
                                selectsStart
                                startDate={this.props.startDate}
                                endDate={this.props.endDate}
                                maxDate={this.props.endDate}
                                // showTimeSelect
                                // maxTime={this.state.endDate.getTime()}
                                minTime={this.props.minTime}
                                maxTime={this.props.endDate}

                                dateFormat="MMMM d, yyyy h:mm aa"
                                // style={{border-width=0}}
                            />
                        </InputGroup>

                        <InputGroup className="ml-3">
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
                                // showTimeSelect
                                maxTime={new Date()}
                                minTime={this.props.startDate}
                                // maxTime={new Date()}
                                dateFormat="MMMM d, yyyy h:mm aa"
                                // className="btn-outline-info"
                            />
                        </InputGroup>
                    </ButtonGroup>
        );
    }
}


class history extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            TestapiResponse : [],
            devices : [],
            friendlyName: [{"FriendlyName": "undefined"}],
            startDate: new Date(),
            endDate: new Date(),
            minTime: new Date()};

        this.state.startDate.setDate(this.state.startDate.getDate() - 1);
        this.state.minTime.setHours(0);
        this.state.minTime.setMinutes(0);
        this.state.minTime.setTime(0);
        // this.state = {}
        // startDate:
        this.handleClick = this.handleClick.bind(this);

    }

    callTestAPI() {
        fetch("http://192.168.1.218:9000/testAPI")
            .then(res => res.json())
            .then(res => this.setState({ testapiResponse: res }));
    }

    getFriendlyName(device) {
        fetch("http://192.168.1.218:9000/getFriendlyName", {
            headers:  {
                'device': device
            }
        })
            .then(res => res.json())
            .then(res => this.setState({ friendlyName: res }));
    }

    getGraphData(devices) {
        console.log(this.state.startDate.toJSON());
        console.log(this.state.startDate.toLocaleDateString());
        fetch("http://192.168.1.218:9000/testAPI", {
            headers:  {
                'startdate': this.state.startDate.toISOString(),
                'enddate': this.state.endDate.toISOString(),
                'devices': devices
            }
        })
            .then(res => res.json())
            .then(res => this.setState({ TestapiResponse: res }));
    }

    callDevices() {
        fetch("http://192.168.1.218:9000/getDevices", {
            // headers: new Headers({'devices': this.state.devices.toString()}), header
        })
            .then(res => res.json())
            .then(res => this.setState({ devices: res }));
    }

    componentDidMount() {
        this.callDevices();
        this.getGraphData();
    }

    ToggleSearch(DeviceID) {
        let newstate = this.state;

        for (const device of newstate.devices) {
            device.active = device.DeviceID === DeviceID;
        }

        this.getFriendlyName(DeviceID);

        this.setState({newstate});
        // this.forceUpdate();
        // $(this)
        // console.log(this.state.apiResponse)
    }

    handleClick(e) {
        e.preventDefault();
        let testDevices = [];

        for (const device of this.state.devices) {
            if (device.active === true) {
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
        // console.log(this.state);
        let response = this.state.TestapiResponse;

        let labels = response.map(function(e) {
            return e.MeasurementTime;
        });

        let data = response.map(function(e) {
            return e.WattValue;
        });

        let Device = response.map(function(e) {
            return e.Device;
        });

        console.log(JSON.stringify(this.state.friendlyName));
        console.log(this.state.friendlyName[0].FriendlyName);

        let chart = {
            labels: labels,
            datasets: [
                {
                    label: this.state.friendlyName[0].FriendlyName,
                    fill: true,
                    lineTension: 0.1,
                    backgroundColor: 'rgba(150,41,77,0.4)',
                    borderColor: 'rgb(150,41,77)',
                    borderCapStyle: 'butt',
                    borderDash: [],
                    borderDashOffset: 0.0,
                    borderJoinStyle: 'miter',
                    pointBorderColor: 'rgb(150,41,77)',
                    pointBackgroundColor: '#fff',
                    pointBorderWidth: 1,
                    pointHoverRadius: 5,
                    pointHoverBackgroundColor: 'rgb(150,41,77)',
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
                display: true,
                position: 'right'
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
                yAxes: [{
                        ticks: {
                            callback: function(value, index, values) {
                                return '$' + value;
                            }
                        }
                }]
                }],

            }
        };


        // const [startDate, setStartDate] = this.useState(new Date("2014/02/08"));
        // const [endDate, setEndDate] = this.useState(new Date("2014/02/10"));

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

                        {/*<Dropdown className='mx-3'>*/}
                        {/*    <Dropdown.Toggle variant='light'>*/}
                        {/*        Device*/}
                        {/*    </Dropdown.Toggle>*/}

                        {/*    <Dropdown.Menu>*/}
                        {/*        {this.state.devices.map(device =>*/}
                        {/*            <Dropdown.Item*/}
                        {/*                active = { device.active }*/}
                        {/*                key = { device.DeviceID }*/}
                        {/*                onClick = { () => { this.ToggleSearch(device.DeviceID) } }*/}
                        {/*                // onClick = { () => this.toggleClass() }*/}
                        {/*            > { device.FriendlyName } </Dropdown.Item>*/}
                        {/*        )}*/}
                        {/*        /!*<this.GetItems/>*!/*/}
                        {/*        /!*<Dropdown.Item href="#/action-1">Action</Dropdown.Item>*!/*/}
                        {/*        /!*<Dropdown.Item href="#/action-2">Another action</Dropdown.Item>*!/*/}
                        {/*        /!*<Dropdown.Item href="#/action-3">Something else</Dropdown.Item>*!/*/}
                        {/*    </Dropdown.Menu>*/}
                        {/*</Dropdown>*/}

                        <Dropdown className='ml-3' as={ButtonGroup}>
                            <Button variant="light" onClick={this.handleClick}>Search</Button>

                            <Dropdown.Toggle split variant="light" id="dropdown-split-basic" />

                            <Dropdown.Menu>
                                {this.state.devices.map(device =>
                                    <Dropdown.Item
                                        active = { device.active }
                                        key = { device.DeviceID }
                                        onClick = { () => { this.ToggleSearch(device.DeviceID) } }
                                        // onClick = { () => this.toggleClass() }
                                    > { device.FriendlyName } </Dropdown.Item>
                                )}
                            </Dropdown.Menu>
                        </Dropdown>

                        {/*<ButtonGroup>*/}
                        {/*    <Button variant='light' onClick={this.handleClick}> Search </Button>*/}
                        {/*</ButtonGroup>*/}
                    </ButtonToolbar>



                <Container>
                    <Line data={chart} options={options}/>
                </Container>
                <hr/>

                {/*<p> {JSON.stringify(this.state.TestapiResponse)} </p>*/}
            </div>
        );
    };
};

export default history;
