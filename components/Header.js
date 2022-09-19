import React, { useEffect, useState } from "react";
import { APP_NAME } from "../config";
import Link from "next/link";
import Router from "next/router";
import NProgress from "nprogress";
//styles
import {
  Collapse,
  Navbar,
  NavbarToggler,
  Nav,
  NavItem,
  NavLink,
} from "reactstrap";
//components
import { signout, isAuth } from "../actions/auth";
import Search from "./blog/Search";

Router.onRouteChangeStart = (url) => NProgress.start();
Router.onRouteChangeComplete = (url) => NProgress.done();
Router.onRouteChangeError = (url) => NProgress.done();

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isAuths, setIsAuths] = useState({});
  const toggle = () => {
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    setIsAuths(isAuth());
  }, []);

  return (
    <>
      <Navbar color="light" light expand="md">
        <Link href="/">
          <NavLink className="font-weight-bold">{APP_NAME}</NavLink>
        </Link>
        <NavbarToggler onClick={toggle} />
        <Collapse isOpen={isOpen} navbar>
          <Nav className="ml-auto" navbar>
            <React.Fragment>
              <NavItem>
                <Link href="/blogs">
                  <NavLink>Blogs</NavLink>
                </Link>
              </NavItem>
              <NavItem>
                <Link href="/contact">
                  <NavLink>Contact</NavLink>
                </Link>
              </NavItem>
            </React.Fragment>
            {!isAuths && (
              <React.Fragment>
                <NavItem>
                  <Link href="/signin">
                    <NavLink>Sign In</NavLink>
                  </Link>
                </NavItem>
                <NavItem>
                  <Link href="/signup">
                    <NavLink>Sign Up</NavLink>
                  </Link>
                </NavItem>
              </React.Fragment>
            )}

            {isAuths && isAuths?.role === 0 && (
              <NavItem>
                <Link href="/user">
                  <NavLink>{`${isAuths?.name}'s Dashboard`}</NavLink>
                </Link>
              </NavItem>
            )}
            {isAuths && isAuths?.role === 1 && (
              <NavItem>
                <Link href="/admin">
                  <NavLink>{`${isAuths?.name}'s Dashboard`}</NavLink>
                </Link>
              </NavItem>
            )}
            {isAuths && (
              <NavItem>
                <NavLink
                  style={{ cursor: "pointer" }}
                  onClick={() => {
                    signout(() => {
                      Router.replace(`/signin`);
                    });
                  }}
                >
                  Sign Out
                </NavLink>
              </NavItem>
            )}
            <NavItem>
              <Link href="/user/crud/blog">
                <NavLink className="btc btn-primary text-light rounded ml-2">
                  Write a blog
                </NavLink>
              </Link>
            </NavItem>
          </Nav>
        </Collapse>
      </Navbar>
      <Search />
    </>
  );
};

export default Header;
