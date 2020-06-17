import React from "react";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Alert from "react-bootstrap/Alert";
import styled from "styled-components";
import * as Yup from "yup";
import { useFormik } from "formik";
import { Card } from "./Card";
import { useState } from "react";
import { useRequest } from "../hooks/useRequest";
import { HTTP_METHOD } from "../types/httpMethod";
import { useRouter } from "next/router";

const H2 = styled.h2`
  margin-bottom: 20px;
  text-align: center;
`;

const P = styled.p`
  text-align: center;
`;

const A = styled.a`
  cursor: pointer;
  text-decoration: underline;
`;

const validationSchema = Yup.object({
  email: Yup.string()
    .email("Email must be valid email")
    .required("Email is required"),
  password: Yup.string()
    .required("Password is required")
    .min(5, "Password should be at least 5 characters long"),
});

const SigninSignup = () => {
  const [isSignupFormVisible, setIsSignupFormVisible] = useState(true);
  const router = useRouter();

  const onSubmit = async () => {
    const data = await doRequest();
    console.log(data);
  };

  const {
    values,
    errors,
    touched,
    handleBlur,
    handleChange,
    handleSubmit,
  } = useFormik({
    validationSchema,
    initialValues: {
      email: "",
      password: "",
    },
    onSubmit,
  });

  const endpoint = isSignupFormVisible
    ? "/api/users/signup"
    : "/api/users/signin";

  const { doRequest, apiErrors } = useRequest({
    url: endpoint,
    method: HTTP_METHOD.POST,
    body: {
      email: values.email,
      password: values.password,
    },
    onSuccess: () => router.push("/"),
  });

  return (
    <Card>
      <H2>Sign {isSignupFormVisible ? "Up" : "In"}</H2>
      <Form onSubmit={handleSubmit}>
        <Form.Group controlId="formBasicEmail">
          <Form.Label>Email address</Form.Label>
          <Form.Control
            type="email"
            placeholder="Enter email"
            name="email"
            value={values.email}
            onChange={handleChange}
            onBlur={handleBlur}
          />
          <Form.Text className="text-muted">
            We'll never share your email with anyone else.
          </Form.Text>
        </Form.Group>
        {touched.email && errors.email && (
          <Alert variant="danger">{errors.email}</Alert>
        )}

        <Form.Group controlId="formBasicPassword">
          <Form.Label>Password</Form.Label>
          <Form.Control
            type="password"
            placeholder="Password"
            name="password"
            value={values.password}
            onChange={handleChange}
            onBlur={handleBlur}
          />
        </Form.Group>
        {touched.password && errors.password && (
          <Alert variant="danger">{errors.password}</Alert>
        )}
        <div className="text-center">
          <Button
            variant="primary"
            type="submit"
            style={{ marginBottom: "10px" }}
          >
            Submit
          </Button>
        </div>
        {apiErrors}
        <P>
          {isSignupFormVisible ? "Already" : "Don't"} have an account? Click{" "}
          <A
            className="text-primary"
            onClick={() => setIsSignupFormVisible(!isSignupFormVisible)}
          >
            here
          </A>{" "}
          to sign {isSignupFormVisible ? "in" : "up"}
        </P>
      </Form>
    </Card>
  );
};

export default SigninSignup;
