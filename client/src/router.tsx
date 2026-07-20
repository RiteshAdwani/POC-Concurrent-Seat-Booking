import { createBrowserRouter, Navigate } from "react-router-dom";
import { AppLayout } from "@/AppLayout";
import { navigationRoutes } from "@/constants/navigationRoutes.constants";
import { CheckoutPage } from "@/pages/CheckoutPage";
import { SeatSelectionPage } from "@/pages/SeatSelectionPage";

/**
 * @description Route table. AppLayout (shared across every route) is what keeps the URL
 * in sync with activeHold and intercepts back-navigation out of /checkout; the routes
 * below only own where each path renders.
 */
export const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      { path: navigationRoutes.Seats, element: <SeatSelectionPage /> },
      { path: navigationRoutes.Checkout, element: <CheckoutPage /> },
      { path: "*", element: <Navigate to={navigationRoutes.Seats} replace /> },
    ],
  },
]);
