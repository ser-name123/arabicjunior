"use client";

import React from "react";
import { StepsProvider } from "react-step-builder";
import StudentRegistrationForm from "./StudentRegistrationForm";

const StudentMultiStepProvider = () => {
  return (
    <React.Fragment>
      <StepsProvider>
        <StudentRegistrationForm />
      </StepsProvider>
    </React.Fragment>
  );
};

export default StudentMultiStepProvider;
