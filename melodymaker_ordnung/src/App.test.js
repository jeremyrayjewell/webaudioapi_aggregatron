import { act } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

jest.mock("./MusicalBigO", () => function MockMusicalBigO() {
  return <div data-testid="musical-big-o" />;
});

jest.mock("./CombinedOverlay", () => function MockCombinedOverlay() {
  return <div data-testid="combined-overlay" />;
});

test("renders the application shell", () => {
  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = createRoot(container);

  act(() => {
    root.render(<App />);
  });

  expect(container.querySelector("h1")?.textContent).toContain("Musical Big-O");
  expect(container.querySelector('[data-testid="musical-big-o"]')).not.toBeNull();

  act(() => {
    root.unmount();
  });
  container.remove();
});
