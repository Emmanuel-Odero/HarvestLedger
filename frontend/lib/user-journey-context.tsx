"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

type JourneyStep = 
  | "welcome"
  | "connect-wallet"
  | "select-role"
  | "complete-profile"
  | "explore-dashboard"
  | "completed";

interface UserJourneyContextType {
  currentStep: JourneyStep;
  completedSteps: JourneyStep[];
  setCurrentStep: (step: JourneyStep) => void;
  completeStep: (step: JourneyStep) => void;
  resetJourney: () => void;
  isStepCompleted: (step: JourneyStep) => boolean;
}

const UserJourneyContext = createContext<UserJourneyContextType | undefined>(undefined);

export function UserJourneyProvider({ children }: { children: ReactNode }) {
  const [currentStep, setCurrentStep] = useState<JourneyStep>("welcome");
  const [completedSteps, setCompletedSteps] = useState<JourneyStep[]>([]);

  const completeStep = (step: JourneyStep) => {
    if (!completedSteps.includes(step)) {
      setCompletedSteps((prev) => [...prev, step]);
    }
  };

  const resetJourney = () => {
    setCurrentStep("welcome");
    setCompletedSteps([]);
  };

  const isStepCompleted = (step: JourneyStep) => completedSteps.includes(step);

  return (
    <UserJourneyContext.Provider
      value={{
        currentStep,
        completedSteps,
        setCurrentStep,
        completeStep,
        resetJourney,
        isStepCompleted,
      }}
    >
      {children}
    </UserJourneyContext.Provider>
  );
}

export function useUserJourney() {
  const context = useContext(UserJourneyContext);
  if (context === undefined) {
    throw new Error("useUserJourney must be used within a UserJourneyProvider");
  }
  return context;
}
