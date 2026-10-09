import {
  UserRound,
  GraduationCap,
  Rocket,
  Building2,
  Wallet,
  UsersRound,
  Link as LinkIcon,
  Check
} from "lucide-react";

import "./SignupProgress.css";

const steps = [
  {
    id: 1,
    title: "Account",
    icon: UserRound
  },
  {
    id: 2,
    title: "Education",
    icon: GraduationCap
  },
  {
    id: 3,
    title: "Startup",
    icon: Rocket
  },
  {
    id: 4,
    title: "Details",
    icon: Building2
  },
  {
    id: 5,
    title: "Funding",
    icon: Wallet
  },
  {
    id: 6,
    title: "Looking For",
    icon: UsersRound
  },
  {
    id: 7,
    title: "Links",
    icon: LinkIcon
  }
];

function SignupProgress({ currentStep }) {
  return (
    <div className="signup-progress">

      {steps.map((step, index) => {
        const Icon = step.icon;

        const isCompleted =
          currentStep > step.id;

        const isCurrent =
          currentStep === step.id;

        return (
          <div
            className="signup-progress-item"
            key={step.id}
          >

            <div
              className={`signup-progress-step ${
                isCompleted
                  ? "signup-progress-completed"
                  : ""
              } ${
                isCurrent
                  ? "signup-progress-current"
                  : ""
              }`}
            >
              {isCompleted ? (
                <Check size={17} />
              ) : (
                <Icon size={17} />
              )}
            </div>

            <span
              className={`signup-progress-label ${
                isCurrent
                  ? "signup-progress-label-current"
                  : ""
              }`}
            >
              {step.title}
            </span>

            {index < steps.length - 1 && (
              <div
                className={`signup-progress-line ${
                  currentStep > step.id
                    ? "signup-progress-line-completed"
                    : ""
                }`}
              />
            )}

          </div>
        );
      })}

    </div>
  );
}

export default SignupProgress;