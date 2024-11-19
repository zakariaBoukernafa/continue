import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import useHistory from "../../../hooks/useHistory";
import { setOnboardingCard } from "../../../redux/slices/uiStateSlice";
import { OnboardingCardState } from "..";
import { RootState } from "../../../redux/store";
import { getLocalStorage, setLocalStorage } from "../../../util/localStorage";

export interface UseOnboardingCard {
  show: OnboardingCardState["show"];
  close: () => void;
}

export function useOnboardingCard(): UseOnboardingCard {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { saveSession } = useHistory(dispatch);

  const onboardingCard = useSelector(
    (state: RootState) => state.uiState.onboardingCard,
  );

  const onboardingStatus = getLocalStorage("onboardingStatus");
  const hasDismissedOnboardingCard = getLocalStorage(
    "hasDismissedOnboardingCard",
  );

  let show: boolean;

  // Always show if we explicitly want to, e.g. passing free trial
  // and setting up keys
  if (onboardingCard.show) {
    show = true;
  } else {
    show = onboardingStatus !== "Completed" && !hasDismissedOnboardingCard;
  }



  function close() {
    setLocalStorage("hasDismissedOnboardingCard", true);
    dispatch(setOnboardingCard({ show: false }));
  }



  return {
    show,
    close,
  };
}
