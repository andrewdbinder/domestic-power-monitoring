import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import Navbar from 'react-bootstrap/Navbar'
import Nav from 'react-bootstrap/Nav'
import logo from "../lightning.svg";

// import {NavLink} from 'react-router-dom';

const Navigation = props => {
    const { location } = props;
    return (
        <Navbar bg="dark" variant="dark" expand="lg">

            <Navbar.Brand>
                <img
                    alt=""
                    src={logo}
                    width="30"
                    height="30"
                    className="d-inline-block align-top"
                />{' '}
                Power Monitor
            </Navbar.Brand>

            <Navbar.Toggle aria-controls="basic-navbar-nav"/>
            <Navbar.Collapse id="basic-navbar-nav">
                <Nav className="ml-auto" activeKey={location.pathname}>
                    <Nav.Link href="/">Home</Nav.Link>
                    <Nav.Link href="/status">Status</Nav.Link>
                    <Nav.Link href="/history">History</Nav.Link>
                    <Nav.Link>⚙</Nav.Link>
                </Nav>
            </Navbar.Collapse>

            {/*<NavLink to="/">Home</NavLink>*/}
            {/*<NavLink to="/about">About</NavLink>*/}
            {/*<NavLink to="/contact">Contact</NavLink>*/}
        </Navbar>
    );
};

export default Navigation;
