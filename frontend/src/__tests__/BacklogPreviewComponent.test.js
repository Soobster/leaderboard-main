import { render, screen, cleanup } from "@testing-library/react";
import "@testing-library/jest-dom";
import BacklogPreview from "../components/BacklogPreviewComponent";
import { BrowserRouter as Router } from "react-router-dom";
import { expect } from "@jest/globals";

test("renders backlog component", async () => {
  render(
    <Router>
      <BacklogPreview />,
    </Router>
  );

  const backlog = screen.getByTestId("backlogPreview-test");
  expect(backlog).toBeInTheDocument();
});
