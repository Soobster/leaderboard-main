import { render, screen, cleanup } from "@testing-library/react";
import "@testing-library/jest-dom";
import Profile from "../components/ProfileComponent";
import { BrowserRouter as Router } from "react-router-dom";
import { expect } from "@jest/globals";

test("renders profile component", async () => {
  render(
    <Router>
      <Profile />
    </Router>
  );

  const profile = screen.getByTestId("profile-test");
  expect(profile).toBeInTheDocument();
});
