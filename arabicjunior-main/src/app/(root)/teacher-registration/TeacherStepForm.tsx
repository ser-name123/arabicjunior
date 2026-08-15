"use client";

import React from "react";
import { StepsProvider } from "react-step-builder";
import TeacherMultiStepForm from "./TeacherMultiStepForm";

const TeacherStepForm = () => {
  return (
    <React.Fragment>
      <StepsProvider>
        <TeacherMultiStepForm />
      </StepsProvider>
    </React.Fragment>
  );
};

export default TeacherStepForm;
