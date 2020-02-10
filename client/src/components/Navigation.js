import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import Navbar from 'react-bootstrap/Navbar'
import Nav from 'react-bootstrap/Nav'

import {NavLink} from 'react-router-dom';

const Navigation = () => {
    return (
        <Navbar bg="dark" variant="dark" expand="lg">

            <Navbar.Brand>Energy Monitor</Navbar.Brand>
            <Navbar.Toggle aria-controls="basic-navbar-nav"/>
            <Navbar.Collapse id="basic-navbar-nav">
                <Nav className="ml-auto">
                    <Nav.Link href="/">Home</Nav.Link>
                    <Nav.Link href="/status">Status</Nav.Link>
                    <Nav.Link href="/history">History</Nav.Link>
                </Nav>
            </Navbar.Collapse>

            {/*<NavLink to="/">Home</NavLink>*/}
            {/*<NavLink to="/about">About</NavLink>*/}
            {/*<NavLink to="/contact">Contact</NavLink>*/}
        </Navbar>
    );
};

export default Navigation;
