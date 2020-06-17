import React from "react";
import Navbar from "react-bootstrap/Navbar";
import Nav from "react-bootstrap/Nav";
import { useRouter } from "next/dist/client/router";

const CustomNav = () => {
  const router = useRouter();
  return (
    <Navbar bg="light" expand="lg">
      <Navbar.Brand onClick={() => router.push("/")}>Ticketing</Navbar.Brand>
      <Navbar.Toggle aria-controls="basic-navbar-nav" />
      <Navbar.Collapse id="basic-navbar-nav">
        <Nav.Link onClick={() => router.push("/join")} className="text-muted">
          Sign Up / Sign In
        </Nav.Link>
      </Navbar.Collapse>
    </Navbar>
  );
};

export default CustomNav;
