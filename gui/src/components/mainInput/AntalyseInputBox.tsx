import { Editor, JSONContent } from "@tiptap/react";
import { ContextItemWithId, InputModifiers } from "core";
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import styled, { keyframes } from "styled-components";
import { defaultBorderRadius, vscBackground } from "..";
import { useWebviewListener } from "../../hooks/useWebviewListener";
import { selectSlashCommands } from "../../redux/selectors";
import { newSession, setMessageAtIndex } from "../../redux/slices/stateSlice";
import { RootState } from "../../redux/store";
import ContextItemsPeek from "./ContextItemsPeek";
import TipTapEditor from "./TipTapEditor";
import AcceptRejectAllButtons from "./AcceptRejectAllButtons";

interface AntalyseInputBoxProps {
  isLastUserInput: boolean;
  isMainInput?: boolean;
  onEnter: (
    editorState: JSONContent,
    modifiers: InputModifiers,
    editor: Editor,
  ) => void;
  editorState?: JSONContent;
  contextItems?: ContextItemWithId[];
  hidden?: boolean;
}

const gradient = keyframes`
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
`;

const GradientBorder = styled.div<{
  borderRadius?: string;
  borderColor?: string;
  loading: 0 | 1;
}>`
  border-radius: ${(props) => props.borderRadius || "8px"};
  padding: 2px;

  background: ${(props) =>
    props.borderColor
      ? props.borderColor
      : `linear-gradient(
        45deg,
        #FF3366,
        #8833FF,
        #33FFCC,
        #FF3366
      )`};
  animation: ${(props) => (props.loading ? gradient : "")} 3s ease infinite;
  box-shadow: ${(props) =>
    props.loading ? "0 4px 12px rgba(0,0,0,0.2)" : "none"};
  transition: all 0.3s ease;

  background-size: 200% 200%;
  width: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
`;

function AntalyseInputBox(props: AntalyseInputBoxProps) {
  const dispatch = useDispatch();

  const active = useSelector((store: RootState) => store.state.active);
  const availableSlashCommands = useSelector(selectSlashCommands);
  const availableContextProviders = useSelector(
    (store: RootState) => store.state.config.contextProviders,
  );
  const isGatheringContextStore = useSelector(
    (store: RootState) => store.state.isGatheringContext,
  );

  const [isGatheringContext, setIsGatheringContext] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const isInMultifileEdit = useSelector(
    (state: RootState) => state.state.isInMultifileEdit,
  );

  const shouldShowAcceptRejectButtons =
    props.isMainInput && isInMultifileEdit && !active;

  useWebviewListener(
    "newSessionWithPrompt",
    async (data) => {
      if (props.isMainInput) {
        dispatch(newSession());
        dispatch(
          setMessageAtIndex({
            message: { role: "user", content: data.prompt },
            index: 0,
          }),
        );
      }
    },
    [props.isMainInput],
  );

  useEffect(() => {
    if (isGatheringContextStore && !isGatheringContext) {
      // 500ms delay when going from false -> true to prevent flashing loading indicator
      timeoutRef.current = setTimeout(() => setIsGatheringContext(true), 500);
    } else {
      // Update immediately otherwise (i.e. true -> false)
      setIsGatheringContext(isGatheringContextStore);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isGatheringContextStore]);

  return (
    <div className={`mb-1 ${props.hidden ? "hidden" : ""}`}>
      {shouldShowAcceptRejectButtons && <AcceptRejectAllButtons />}

      <div className={`relative flex px-2`}>
        <GradientBorder
          loading={active && props.isLastUserInput ? 1 : 0}
          borderColor={
            active && props.isLastUserInput ? undefined : vscBackground
          }
          borderRadius={defaultBorderRadius}
        >
          <TipTapEditor
            editorState={props.editorState}
            onEnter={(...args) => {
              props.onEnter(...args);
              if (props.isMainInput) {
                args[2].commands.clearContent(true);
              }
            }}
            isMainInput={props.isMainInput ?? false}
            availableContextProviders={availableContextProviders ?? []}
            availableSlashCommands={availableSlashCommands}
            historyKey="chat"
          />
        </GradientBorder>
      </div>
      <ContextItemsPeek
        contextItems={props.contextItems}
        isGatheringContext={isGatheringContext && props.isLastUserInput}
      />
    </div>
  );
}

export default AntalyseInputBox;
