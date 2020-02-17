import React from 'react';
import logo from "../masoon.png";
import { Line } from 'react-chartjs-2';
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import DatePicker from "react-datepicker/es";

import "react-datepicker/dist/react-datepicker.css";


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

    state = {
        startDate: new Date()
    };



    render() {
        let response = this.state.apiResponse;

        let labels = response.map(function(e) {
            return e.MeasurementTime;
        });

        let data = response.map(function(e) {
            return e.WattValue;
        });

        let Device = response.map(function(e) {
            return e.Device[0];
        });

        let chart = {
            labels: labels,
            datasets: [
                {
                    label: 'Microwave',
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
            ]
        };

        // const [startDate, setStartDate] = useState(new Date("2014/02/08"));
        // const [endDate, setEndDate] = useState(new Date("2014/02/10"));

        return (
            <div>
                <h1>Usage History</h1>
                <hr>
                </hr>

                {/*<img src={logo} className="App-logo" alt="logo"/>*/}
                <Container>
                    {/*<DatePicker*/}
                    {/*    selected={startDate}*/}
                    {/*    onChange={date => setStartDate(date)}*/}
                    {/*    selectsStart*/}
                    {/*    startDate={startDate}*/}
                    {/*    endDate={endDate}*/}
                    {/*/>*/}
                    {/*<DatePicker*/}
                    {/*    selected={endDate}*/}
                    {/*    onChange={date => setEndDate(date)}*/}
                    {/*    selectsEnd*/}
                    {/*    startDate={startDate}*/}
                    {/*    endDate={endDate}*/}
                    {/*    minDate={startDate}*/}
                    {/*/>*/}
                </Container>

                <Container>
                    <Line data={chart} />
                </Container>

                <hr>
                </hr>

                {/*<div>*/}
                {/*    <Line data={chart} />*/}
                {/*</div>*/}

                <p>{JSON.stringify(response)}</p>
            </div>
        );
    };

    handleStartChange = startDate => {
        this.setState({
            startDate
        });
    };

    handleEndChange = endDate => {
        this.setState({
            endDate
        });
    };
};

export default history;
