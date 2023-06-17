import { render, screen, cleanup } from "@testing-library/react";
import "@testing-library/jest-dom";
import GamePreview from "../components/GamePreviewComponent";
import { BrowserRouter as Router } from "react-router-dom";
import { expect } from "@jest/globals";

test("renders game preview component", async () => {
  render(
    <Router>
      <GamePreview props="13" /> {/* Needs gameID parameter; 13 = Fallout */}
    </Router>
  );

  const preview = screen.getByTestId("gamePreview-test");
  expect(preview).toBeInTheDocument();
});
