import styled from "styled-components";
import { vscForeground } from "../..";

const Title = styled.div`
  color: ${vscForeground};
  font-weight: bold;
  padding: 0.5rem 0;
  border-bottom: 0.5px solid ${vscForeground};
`;

const MobileTitle = styled.div`
  width: 100%;
  padding: 0.5rem;
  color: ${vscForeground};
  border-bottom: 1px solid ${vscForeground};
  font-size: 1rem;
`;

export function OnboardingHeader() {
  return (
    <div>
      <div className="xs:block hidden">
        <Title>
          <p className="m-0 hidden font-medium md:block">Local with Ollama</p>
          <p className="m-0 block font-medium md:hidden">Local</p>
        </Title>
      </div>
      <div className="xs:hidden block">
        <MobileTitle>Local</MobileTitle>
      </div>
    </div>
  );
}
