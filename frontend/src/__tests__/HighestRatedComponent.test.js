import { render, screen, cleanup } from "@testing-library/react";
import "@testing-library/jest-dom";
import HighestRated from "../components/HighestRatedComponent";
import { BrowserRouter as Router } from "react-router-dom";
import { expect } from "@jest/globals";

test("renders highest rated component", async () => {
  render(
    <Router>
      <HighestRated />
    </Router>
  );

  const highestRated = screen.getByTestId("highestRated-test");
  expect(highestRated).toBeInTheDocument();
});
