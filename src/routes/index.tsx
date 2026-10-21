import { createFileRoute, redirect } from "@tanstack/react-router";

// The demonstration journey starts at the marketplace. The original landing page, with its
// seeded data, is kept at /prototype-home.
export const Route = createFileRoute("/")({
  beforeLoad: () => {
    throw redirect({ to: "/market" });
  },
});
