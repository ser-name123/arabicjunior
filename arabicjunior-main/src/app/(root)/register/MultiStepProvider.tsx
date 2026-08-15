'use client'; 

import React from "react";
import { StepsProvider } from "react-step-builder";
import MultiStepRegistrationForm from "./MultiStepRegistrationForm";

const MultiStepProvider = () => {
  return (
    <React.Fragment>
      <StepsProvider>
        <MultiStepRegistrationForm />
      </StepsProvider>
    </React.Fragment>
  );
};

export default MultiStepProvider;
