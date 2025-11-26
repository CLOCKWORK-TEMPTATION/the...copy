import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import ShotsPage from "./page";

describe("ShotsPage", () => {
  it("renders without crashing", () => {
    render(<ShotsPage />);
    expect(screen.getByRole("heading", { name: /shots/i })).toBeInTheDocument();
  });
});
