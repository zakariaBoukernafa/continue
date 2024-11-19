import { useDispatch } from "react-redux";
import { useNavigate, useRouteError } from "react-router-dom";
import { newSession } from "../redux/slices/stateSlice";
import { vscBackground } from "../components";
import AntalyseButton from "../components/mainInput/AntalyseButton";

export default function ErrorPage() {
  const error: any = useRouteError();
  console.error(error);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  return (
    <div
      id="error-page"
      className="text-center"
      style={{ backgroundColor: vscBackground }}
    >
      <h1>Error in antalyse React App</h1>
      <p>
        <i>{error.statusText || error.message}</i>
      </p>
      <br />
      <p>Click below to antalyse</p>
      <br />
      <AntalyseButton
        disabled={false}
        showStop={false}
        onClick={() => {
          dispatch(newSession());
          localStorage.removeItem("persist:root");
          navigate("/");
        }}
      ></AntalyseButton>
    </div>
  );
}
