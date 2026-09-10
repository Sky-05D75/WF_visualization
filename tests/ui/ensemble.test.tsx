// @vitest-environment jsdom
import { afterEach, expect, it, vi } from "vitest";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import App from "../../src/app/App";
import { AlleleTrajectoryPlot } from "../../src/visualization/AlleleTrajectoryPlot";
import { runForward } from "../../src/simulation/runForward";
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});
it("colors trajectories by absorption and highlights exactly one, selectable trajectory", () => {
  const parameters = {
    populationSize: 10,
    initialAlleleCount: 10,
    generations: 1,
    seed: 42,
    replicates: 3,
  };
  const runs = [
    runForward({ ...parameters, initialAlleleCount: 0 }),
    runForward({ ...parameters, initialAlleleCount: 20 }),
    runForward(parameters),
  ];
  const { container } = render(
    <AlleleTrajectoryPlot result={{ parameters, runs }} />,
  );
  expect(container.querySelectorAll(".frequency-line")).toHaveLength(3);
  for (const status of ["lost", "fixed", "segregating"])
    expect(
      container.querySelectorAll(`.frequency-line.${status}`),
    ).toHaveLength(1);
  expect(
    container.querySelectorAll(".frequency-line.highlighted"),
  ).toHaveLength(1);
  expect(
    container.querySelector(".frequency-line.highlighted.lost"),
  ).toBeTruthy();
  fireEvent.change(screen.getByLabelText("突出显示轨迹"), {
    target: { value: "1" },
  });
  expect(
    container.querySelector(".frequency-line.highlighted.fixed"),
  ).toBeTruthy();
});
it("runs via space with automatic randomness, ignores repeats and preserves input keyboard behavior", async () => {
  const random = vi.spyOn(crypto, "getRandomValues");
  const { container } = render(<App />);
  expect(screen.queryByLabelText("随机种子")).toBeNull();
  fireEvent.change(screen.getByLabelText("轨迹数 R"), {
    target: { value: "1" },
  });
  fireEvent.keyDown(window, { code: "Space", repeat: true });
  fireEvent.keyDown(screen.getByLabelText("模拟代数 T"), { code: "Space" });
  expect(random).not.toHaveBeenCalled();
  fireEvent.keyDown(window, { code: "Space" });
  await screen.findByRole("img", {}, { timeout: 5000 });
  expect(container.querySelectorAll(".frequency-line")).toHaveLength(1);
  expect(random).toHaveBeenCalledTimes(1);
  fireEvent.keyDown(window, { code: "Space" });
  await screen.findByRole("img", {}, { timeout: 5000 });
  expect(random).toHaveBeenCalledTimes(2);
});
it("renders 100 trajectories and prevents a cancelled experiment from restoring stale results", async () => {
  const { container } = render(<App />);
  fireEvent.change(screen.getByLabelText("模拟代数 T"), {
    target: { value: "1" },
  });
  fireEvent.change(screen.getByLabelText("轨迹数 R"), {
    target: { value: "100" },
  });
  fireEvent.click(screen.getByRole("button", { name: /运行模拟/ }));
  await screen.findByRole("img", {}, { timeout: 5000 });
  expect(container.querySelectorAll(".frequency-line")).toHaveLength(100);
  fireEvent.click(screen.getByRole("button", { name: /运行模拟/ }));
  fireEvent.change(screen.getByLabelText("模拟代数 T"), {
    target: { value: "2" },
  });
  await waitFor(() => expect(screen.queryByRole("img")).toBeNull());
  expect(screen.getByRole("button", { name: /运行模拟/ })).toBeTruthy();
});
