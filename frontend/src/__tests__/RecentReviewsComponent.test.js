import { render, screen, cleanup } from "@testing-library/react";
import "@testing-library/jest-dom";
import RecentActivity from "../components/RecentActivityComponent";
import { BrowserRouter as Router } from "react-router-dom";
import { expect } from "@jest/globals";

test("renders recent reviews component", async () => {
  render(
    <Router>
      <RecentActivity parentPage="HomePage" />, {/* Requires parent page prop*/}
    </Router>
  );

  const recents = screen.getByTestId("recentReviews-test");
  expect(recents).toBeInTheDocument();
});
