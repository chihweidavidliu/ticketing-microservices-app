import React from "react";
import Navbar from "react-bootstrap/Navbar";
import Nav from "react-bootstrap/Nav";
import { useRouter } from "next/dist/client/router";
import { useAuthContext } from "../context/AuthContext";

const CustomNav = () => {
  const router = useRouter();
  const { currentUser, signout } = useAuthContext();

  const renderLink = (link: { label: string; callback: () => void }) => {
    return (
      <Nav.Link onClick={link.callback} className="text-muted">
        {link.label}
      </Nav.Link>
    );
  };

  const renderLinks = () => {
    const links = {
      signOut: { label: "Sign Out", callback: signout },
      signIn: { label: "Sign In", callback: () => router.push("/signin") },
      signUp: { label: "Sign Up", callback: () => router.push("/signup") },
    };

    if (currentUser) {
      return renderLink(links.signOut);
    }

    switch (router.pathname) {
      case "/signin":
        return renderLink(links.signUp);
      case "/signup":
        return renderLink(links.signIn);
      default:
        return (
          <>
            {renderLink(links.signIn)}
            {renderLink(links.signUp)}
          </>
        );
    }
  };

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
        {currentUser && (
          <Nav.Item className="text-dark">{currentUser.email}</Nav.Item>
        )}
        {renderLinks()}
      </Navbar.Collapse>
    </Navbar>
  );
};

export default CustomNav;
