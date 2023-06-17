import { render, screen, cleanup } from "@testing-library/react";
import "@testing-library/jest-dom";
import Tag from "../components/TagComponent";
import { BrowserRouter as Router } from "react-router-dom";
import { expect } from "@jest/globals";

test("renders tag component", async () => {
  render(
    <Router>
      <Tag />
    </Router>
  );

  const tag = screen.getByTestId("tag-test");
  expect(tag).toBeInTheDocument();
});
