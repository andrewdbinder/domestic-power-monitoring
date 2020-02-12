import React from 'react';
import logo from "../masoon.png";
import { Line } from 'react-chartjs-2';
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'

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
                    backgroundColor: 'rgba(54,93,150,0.4)',
                    borderColor: 'rgb(54,93,150)',
                    borderCapStyle: 'butt',
                    borderDash: [],
                    borderDashOffset: 0.0,
                    borderJoinStyle: 'miter',
                    pointBorderColor: 'rgb(54,93,150)',
                    pointBackgroundColor: '#fff',
                    pointBorderWidth: 1,
                    pointHoverRadius: 5,
                    pointHoverBackgroundColor: 'rgba(75,192,192,1)',
                    pointHoverBorderColor: 'rgba(220,220,220,1)',
                    pointHoverBorderWidth: 2,
                    pointRadius: 1,
                    pointHitRadius: 10,
                    data: data
                }
            ]
        };



        return (
            <div>
                <h1>Usage History</h1>
                <hr>
                </hr>
                {/*<img src={logo} className="App-logo" alt="logo"/>*/}

                <Container>
                    <Line data={chart} />
                </Container>

                {/*<div>*/}
                {/*    <Line data={chart} />*/}
                {/*</div>*/}

                <p>{JSON.stringify(response)}</p>
            </div>
        );
    };
};

export default history;
