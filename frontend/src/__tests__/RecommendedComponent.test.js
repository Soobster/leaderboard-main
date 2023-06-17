import { render, screen, cleanup } from "@testing-library/react";
import "@testing-library/jest-dom";
import Recommended from "../components/RecommendedComponent";
import { BrowserRouter as Router } from "react-router-dom";
import { expect } from "@jest/globals";

test("renders recommended component", async () => {
  render(
    <Router>
      <Recommended />
    </Router>
  );

  const recommended = screen.getByTestId("recommended-test");
  expect(recommended).toBeInTheDocument();
});
