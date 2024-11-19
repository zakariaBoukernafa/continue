import {
  ArrowLeftIcon,
  ChatBubbleOvalLeftIcon,
  CodeBracketSquareIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import { JSONContent } from "@tiptap/react";
import { InputModifiers } from "core";
import { usePostHog } from "posthog-js/react";
import {
  Fragment,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { ErrorBoundary } from "react-error-boundary";
import { useDispatch, useSelector } from "react-redux";
import styled from "styled-components";
import {
  Button,
  defaultBorderRadius,
  lightGray,
  vscBackground,
} from "../../components";
import { ChatScrollAnchor } from "../../components/ChatScrollAnchor";
import { useFindWidget } from "../../components/find/FindWidget";
import StepContainer from "../../components/gui/StepContainer";
import TimelineItem from "../../components/gui/TimelineItem";
import AntalyseInputBox from "../../components/mainInput/antalyseInputBox";
import { defaultInputModifiers } from "../../components/mainInput/inputModifiers";
import { NewSessionButton } from "../../components/mainInput/NewSessionButton";
import { TutorialCard } from "../../components/mainInput/TutorialCard";
import {
  OnboardingCard,
  useOnboardingCard,
} from "../../components/OnboardingCard";
import { IdeMessengerContext } from "../../context/IdeMessenger";
import useChatHandler from "../../hooks/useChatHandler";
import useHistory from "../../hooks/useHistory";
import { useTutorialCard } from "../../hooks/useTutorialCard";
import { useWebviewListener } from "../../hooks/useWebviewListener";
import { defaultModelSelector } from "../../redux/selectors/modelSelectors";
import {
  clearLastResponse,
  deleteMessage,
  newSession,
  setInactive,
} from "../../redux/slices/stateSlice";
import {
  setDialogEntryOn,
  setDialogMessage,
  setShowDialog,
} from "../../redux/slices/uiStateSlice";
import { RootState } from "../../redux/store";
import {
  getFontSize,
  getMetaKeyLabel,
  isJetBrains,
  isMetaEquivalentKeyPressed,
} from "../../util";
import { FREE_TRIAL_LIMIT_REQUESTS } from "../../util/freeTrial";
import { getLocalStorage, setLocalStorage } from "../../util/localStorage";

const StopButton = styled.div`
  background-color: ${vscBackground};
  width: fit-content;
  margin-right: auto;
  margin-left: auto;
  font-size: ${getFontSize() - 2}px;
  border: 0.5px solid ${lightGray};
  border-radius: ${defaultBorderRadius};
  padding: 4px 8px;
  color: ${lightGray};
  cursor: pointer;
  box-shadow:
    0 4px 6px rgba(0, 0, 0, 0.1),
    0 1px 3px rgba(0, 0, 0, 0.08);
  transition: box-shadow 0.3s ease;

  &:hover {
    box-shadow:
      0 6px 8px rgba(0, 0, 0, 0.15),
      0 3px 6px rgba(0, 0, 0, 0.1);
  }
`;

const StepsDiv = styled.div`
  position: relative;
  background-color: transparent;
  flex: 1; // Add this to allow flex growing
  min-height: 0; // Add this to enable proper scrolling

  & > * {
    position: relative;
  }

  .thread-message {
    margin: 8px 4px 0 4px;
  }
`;

function fallbackRender({ error, resetErrorBoundary }: any) {
  // Call resetErrorBoundary() to reset the error boundary and retry the render.

  return (
    <div
      role="alert"
      className="px-2"
      style={{ backgroundColor: vscBackground }}
    >
      <p>Something went wrong:</p>
      <pre style={{ color: "red" }}>{error.message}</pre>

      <div className="text-center">
        <Button onClick={resetErrorBoundary}>Restart</Button>
      </div>
    </div>
  );
}

export function Chat() {
  const posthog = usePostHog();
  const dispatch = useDispatch();
  const ideMessenger = useContext(IdeMessengerContext);
  const { streamResponse } = useChatHandler(dispatch, ideMessenger);
  const onboardingCard = useOnboardingCard();
  const { showTutorialCard, closeTutorialCard } = useTutorialCard();
  const defaultModel = useSelector(defaultModelSelector);
  const ttsActive = useSelector((state: RootState) => state.state.ttsActive);
  const active = useSelector((state: RootState) => state.state.active);
  const [stepsOpen, setStepsOpen] = useState<(boolean | undefined)[]>([]);
  const mainTextInputRef = useRef<HTMLInputElement>(null);
  const stepsDivRef = useRef<HTMLDivElement>(null);
  const [isAtBottom, setIsAtBottom] = useState<boolean>(false);
  const state = useSelector((state: RootState) => state.state);
  const { saveSession, getLastSessionId, loadLastSession } =
    useHistory(dispatch);

  const snapToBottom = useCallback(() => {
    if (!stepsDivRef.current) return;
    const elem = stepsDivRef.current;
    elem.scrollTop = elem.scrollHeight - elem.clientHeight;

    setIsAtBottom(true);
  }, [stepsDivRef, setIsAtBottom]);

  const smoothScrollToBottom = useCallback(async () => {
    if (!stepsDivRef.current) return;
    const elem = stepsDivRef.current;
    elem.scrollTo({
      top: elem.scrollHeight - elem.clientHeight,
      behavior: "smooth",
    });

    setIsAtBottom(true);
  }, [stepsDivRef, setIsAtBottom]);

  useEffect(() => {
    if (active) snapToBottom();
  }, [active, snapToBottom]);

  useEffect(() => {
    setTimeout(() => {
      smoothScrollToBottom();
    }, 400);
  }, [smoothScrollToBottom, state.sessionId]);

  useEffect(() => {
    // Cmd + Backspace to delete current step
    const listener = (e: any) => {
      if (
        e.key === "Backspace" &&
        isMetaEquivalentKeyPressed(e) &&
        !e.shiftKey
      ) {
        dispatch(setInactive());
      }
    };
    window.addEventListener("keydown", listener);

    return () => {
      window.removeEventListener("keydown", listener);
    };
  }, [active]);

  const handleScroll = () => {
    // Temporary fix to account for additional height when code blocks are added
    const OFFSET_HERUISTIC = 300;
    if (!stepsDivRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } = stepsDivRef.current;
    const atBottom =
      scrollHeight - clientHeight <= scrollTop + OFFSET_HERUISTIC;

    setIsAtBottom(atBottom);
  };

  const { widget, highlights } = useFindWidget(stepsDivRef);

  const sendInput = useCallback(
    (editorState: JSONContent, modifiers: InputModifiers) => {
      if (defaultModel?.provider === "free-trial") {
        const u = getLocalStorage("ftc");
        if (u) {
          setLocalStorage("ftc", u + 1);

          if (u >= FREE_TRIAL_LIMIT_REQUESTS) {
            onboardingCard.open("Best");
            posthog?.capture("ftc_reached");
            ideMessenger.ide.showToast(
              "info",
              "You've reached the free trial limit. Please configure a model to antalyse.",
            );
            return;
          }
        } else {
          setLocalStorage("ftc", 1);
        }
      }

      streamResponse(editorState, modifiers, ideMessenger);

      // Increment localstorage counter for popup
      const currentCount = getLocalStorage("mainTextEntryCounter");
      if (currentCount) {
        setLocalStorage("mainTextEntryCounter", currentCount + 1);
        if (currentCount === 300) {
          dispatch(
            setDialogMessage(
              <div className="p-4 text-center">
                👋 Thanks for using antalyse. We are always trying to improve
                and love hearing from users. If you're interested in speaking,
                enter your name and email. We won't use this information for
                anything other than reaching out.
                <br />
                <br />
                <form
                  onSubmit={(e: any) => {
                    e.preventDefault();
                    posthog?.capture("user_interest_form", {
                      name: e.target.elements[0].value,
                      email: e.target.elements[1].value,
                    });
                    dispatch(
                      setDialogMessage(
                        <div className="p-4 text-center">
                          Thanks! We'll be in touch soon.
                        </div>,
                      ),
                    );
                  }}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px",
                  }}
                >
                  <input
                    style={{ padding: "10px", borderRadius: "5px" }}
                    type="text"
                    name="name"
                    placeholder="Name"
                    required
                  />
                  <input
                    style={{ padding: "10px", borderRadius: "5px" }}
                    type="email"
                    name="email"
                    placeholder="Email"
                    required
                  />
                  <button
                    style={{
                      padding: "10px",
                      borderRadius: "5px",
                      cursor: "pointer",
                    }}
                    type="submit"
                  >
                    Submit
                  </button>
                </form>
              </div>,
            ),
          );
          dispatch(setDialogEntryOn(false));
          dispatch(setShowDialog(true));
        }
      } else {
        setLocalStorage("mainTextEntryCounter", 1);
      }
    },
    [state.history, state.contextItems, defaultModel, state, streamResponse],
  );

  useWebviewListener(
    "newSession",
    async () => {
      saveSession();
      mainTextInputRef.current?.focus?.();
    },
    [saveSession],
  );

  const isLastUserInput = useCallback(
    (index: number): boolean => {
      return !state.history
        .slice(index + 1)
        .some((entry) => entry.message.role === "user");
    },
    [state.history],
  );

  const showScrollbar =
    state.config.ui?.showChatScrollbar || window.innerHeight > 5000;

  return (
    <div className="flex h-full flex-col">
      {" "}
      {/* Add this wrapper */}
      {widget}
      <StepsDiv
        ref={stepsDivRef}
        className={`overflow-y-scroll pt-[8px] ${
          showScrollbar ? "thin-scrollbar" : "no-scrollbar"
        } ${state.history.length > 0 ? "flex-1" : "flex flex-1 items-end"}`}
        onScroll={handleScroll}
      >
        {highlights}
        {state.history.map((item, index: number) => (
          <Fragment key={item.message.id}>
            <ErrorBoundary
              FallbackComponent={fallbackRender}
              onReset={() => {
                dispatch(newSession());
              }}
            >
              {item.message.role === "user" ? (
                <AntalyseInputBox
                  onEnter={async (editorState, modifiers) => {
                    streamResponse(editorState, modifiers, ideMessenger, index);
                  }}
                  isLastUserInput={isLastUserInput(index)}
                  isMainInput={false}
                  editorState={item.editorState}
                  contextItems={item.contextItems}
                />
              ) : (
                <div className="thread-message">
                  <TimelineItem
                    item={item}
                    iconElement={
                      false ? (
                        <CodeBracketSquareIcon width="16px" height="16px" />
                      ) : false ? (
                        <ExclamationTriangleIcon
                          width="16px"
                          height="16px"
                          color="red"
                        />
                      ) : (
                        <ChatBubbleOvalLeftIcon width="16px" height="16px" />
                      )
                    }
                    open={
                      typeof stepsOpen[index] === "undefined"
                        ? false
                          ? false
                          : true
                        : stepsOpen[index]!
                    }
                    onToggle={() => {}}
                  >
                    <StepContainer
                      index={index}
                      isLast={index === state.history.length - 1}
                      isFirst={index === 0}
                      open={
                        typeof stepsOpen[index] === "undefined"
                          ? true
                          : stepsOpen[index]!
                      }
                      key={index}
                      onUserInput={(input: string) => {}}
                      item={item}
                      onReverse={() => {}}
                      onRetry={() => {
                        streamResponse(
                          state.history[index - 1].editorState,
                          state.history[index - 1].modifiers ??
                            defaultInputModifiers,
                          ideMessenger,
                          index - 1,
                        );
                      }}
                      onantalyseGeneration={() => {
                        window.postMessage(
                          {
                            messageType: "userInput",
                            data: {
                              input:
                                "antalyse your response exactly where you left off:",
                            },
                          },
                          "*",
                        );
                      }}
                      onDelete={() => {
                        dispatch(deleteMessage(index));
                      }}
                      modelTitle={item.promptLogs?.[0]?.modelTitle ?? ""}
                    />
                  </TimelineItem>
                </div>
              )}
            </ErrorBoundary>
          </Fragment>
        ))}
        <ChatScrollAnchor
          scrollAreaRef={stepsDivRef}
          isAtBottom={isAtBottom}
          trackVisibility={active}
        />
      </StepsDiv>
      <div className={`mt-auto`}>
        {" "}
        {/* Add mt-auto to push to bottom */}
        <div className="relative">
          <div className="absolute -top-8 right-2 z-30">
            {ttsActive && (
              <StopButton
                className=""
                onClick={() => {
                  ideMessenger.post("tts/kill", undefined);
                }}
              >
                ■ Stop TTS
              </StopButton>
            )}
            {active && (
              <StopButton
                onClick={() => {
                  dispatch(setInactive());
                  if (
                    state.history[state.history.length - 1]?.message.content
                      .length === 0
                  ) {
                    dispatch(clearLastResponse());
                  }
                }}
              >
                {getMetaKeyLabel()} ⌫ Cancel
              </StopButton>
            )}
          </div>
          <AntalyseInputBox
            isMainInput
            isLastUserInput={false}
            onEnter={(editorContent, modifiers) => {
              sendInput(editorContent, modifiers);
            }}
          />

          <div
            style={{
              pointerEvents: active ? "none" : "auto",
            }}
          >
            {state.history.length > 0 ? (
              <div className="xs:inline mt-2 hidden">
                <NewSessionButton
                  onClick={() => {
                    saveSession();
                  }}
                  className="mr-auto"
                >
                  <span className="xs:inline hidden">
                    New Session ({getMetaKeyLabel()} {isJetBrains() ? "J" : "L"}
                    )
                  </span>
                </NewSessionButton>
              </div>
            ) : (
              <>
                {getLastSessionId() ? (
                  <div className="xs:inline mt-2 hidden">
                    <NewSessionButton
                      onClick={async () => {
                        loadLastSession().catch((e) =>
                          console.error(`Failed to load last session: ${e}`),
                        );
                      }}
                      className="mr-auto flex items-center gap-2"
                    >
                      <ArrowLeftIcon className="h-3 w-3" />
                      Last Session
                    </NewSessionButton>
                  </div>
                ) : null}

                {onboardingCard.show && (
                  <div className="mx-2 mt-10">
                    <OnboardingCard activeTab={onboardingCard.activeTab} />
                  </div>
                )}

                {showTutorialCard !== false && !onboardingCard.open && (
                  <div className="flex w-full justify-center">
                    <TutorialCard onClose={closeTutorialCard} />
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
