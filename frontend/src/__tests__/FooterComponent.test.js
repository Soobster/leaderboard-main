import { render, screen, cleanup } from "@testing-library/react";
import "@testing-library/jest-dom";
import Footer from "../components/FooterComponent";
import { BrowserRouter as Router } from "react-router-dom";
import { expect } from "@jest/globals";

test("renders footer component", async () => {
  render(
    <Router>
      <Footer />,
    </Router>
  );

  const footer = screen.getByTestId("footer-test");
  expect(footer).toBeInTheDocument();
  expect(screen.getByText("IGDB")).toBeInTheDocument();
});
