import posthog from "posthog-js";
import { PostHogProvider } from "posthog-js/react";
import React, { PropsWithChildren, useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../redux/store";

const CustomPostHogProvider = ({ children }: PropsWithChildren) => {
  const [client, setClient] = React.useState<any>(undefined);

  useEffect(() => {
    setClient(undefined);
  });

  return <>{children}</>;
};

export default CustomPostHogProvider;
