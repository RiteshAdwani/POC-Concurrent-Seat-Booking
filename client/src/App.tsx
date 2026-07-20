import { RouterProvider } from "react-router-dom";
import { router } from "@/router";

/**
 * @description Root component — renders the app's router. Assumes it's rendered inside
 * SeatSocketProvider.
 */
const App = () => {
  return <RouterProvider router={router} />;
}

export default App;
