import React from "react";
import Navbar from "react-bootstrap/Navbar";
import Nav from "react-bootstrap/Nav";
import { useRouter } from "next/dist/client/router";
import { useAuthContext } from "../context/AuthContext";

const CustomNav = () => {
  const router = useRouter();
  const { currentUser, signout } = useAuthContext();

  console.log("currentUser nav", currentUser);

  return (
    <Navbar bg="light" expand="lg">
      <Navbar.Brand
        onClick={() => router.push("/")}
        style={{ cursor: "pointer" }}
      >
        Ticket Buddy
      </Navbar.Brand>

      <Navbar.Toggle aria-controls="basic-navbar-nav" />
      <Navbar.Collapse id="basic-navbar-nav" className="justify-content-end">
        {currentUser ? (
          <>
            <Nav.Item className="text-dark">{currentUser.email}</Nav.Item>
            <Nav.Link onClick={signout} className="text-muted">
              Sign Out
            </Nav.Link>
          </>
        ) : (
          <>
            <Nav.Link
              onClick={() => router.push("/signin")}
              className="text-muted"
            >
              Sign In
            </Nav.Link>
            <Nav.Link
              onClick={() => router.push("/signup")}
              className="text-muted"
            >
              Sign Up
            </Nav.Link>
          </>
        )}
      </Navbar.Collapse>
    </Navbar>
  );
};

export default CustomNav;
