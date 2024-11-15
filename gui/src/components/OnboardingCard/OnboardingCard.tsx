import { Local } from "./tabs";
import { OnboardingHeader } from "./components/OnboardingCardTabs";
import { XMarkIcon } from "@heroicons/react/24/outline";
import styled from "styled-components";
import { CloseButton, defaultBorderRadius, vscInputBackground } from "../";
import { getLocalStorage, setLocalStorage } from "../../util/localStorage";
import { useOnboardingCard } from "./hooks/useOnboardingCard";

const StyledCard = styled.div`
  margin: auto;
  border-radius: ${defaultBorderRadius};
  background-color: ${vscInputBackground};
  box-shadow:
    0 20px 25px -5px rgb(0 0 0 / 0.1),
    0 8px 10px -6px rgb(0 0 0 / 0.1);
`;

export interface OnboardingCardState {
  show?: boolean;
}

export function OnboardingCard() {
  const onboardingCard = useOnboardingCard();

  if (getLocalStorage("onboardingStatus") === undefined) {
    setLocalStorage("onboardingStatus", "Started");
  }

  return (
    <StyledCard className="xs:py-4 xs:px-4 relative px-2 py-3">
      <OnboardingHeader />
      <CloseButton onClick={onboardingCard.close}>
        <XMarkIcon className="hidden h-5 w-5 sm:flex" />
      </CloseButton>
      <div className="content py-4">
        <Local />
      </div>
    </StyledCard>
  );
}
