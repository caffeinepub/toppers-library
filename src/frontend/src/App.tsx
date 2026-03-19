import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { Toaster } from "@/components/ui/sonner";
import { useInitialize } from "@/hooks/useQueries";
import { AdminLoginPage } from "@/pages/AdminLoginPage";
import { AdminPage } from "@/pages/AdminPage";
import { HomePage } from "@/pages/HomePage";
import { RoomsPage } from "@/pages/RoomsPage";
import { SeatBookingPage } from "@/pages/SeatBookingPage";
import { StudentLoginPage } from "@/pages/StudentLoginPage";
import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
  useRouterState,
} from "@tanstack/react-router";

function AppShell() {
  useInitialize();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isAdmin = pathname.startsWith("/admin");

  return (
    <div className="flex flex-col min-h-screen">
      {!isAdmin && <Navbar />}
      <div className="flex-1">
        <Outlet />
      </div>
      {!isAdmin && <Footer />}
    </div>
  );
}

const rootRoute = createRootRoute({ component: AppShell });

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: HomePage,
});

const roomsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/rooms",
  component: RoomsPage,
});

const seatBookingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/rooms/$roomId",
  component: SeatBookingPage,
});

const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin",
  component: AdminPage,
});

const adminLoginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin-login",
  component: AdminLoginPage,
});

const studentLoginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/student-login",
  component: StudentLoginPage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  roomsRoute,
  seatBookingRoute,
  adminRoute,
  adminLoginRoute,
  studentLoginRoute,
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return (
    <>
      <RouterProvider router={router} />
      <Toaster richColors position="top-right" />
    </>
  );
}
