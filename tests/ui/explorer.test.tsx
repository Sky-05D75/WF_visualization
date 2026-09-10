// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "../../src/app/App";
import { neutralContent } from "../../src/theory/neutralContent";
import katex from "katex";
afterEach(cleanup);
describe("teaching experiment", () => {
  it("runs, inspects generations, invalidates stale results and resets", async () => {
    const user = userEvent.setup();
    render(<App />);
    expect(
      screen.queryByRole("img", { name: "A 的等位基因频率轨迹" }),
    ).toBeNull();
    await user.click(screen.getByRole("button", { name: /运行模拟/ }));
    expect(
      await screen.findByRole(
        "img",
        { name: "A 的等位基因频率轨迹" },
        { timeout: 5000 },
      ),
    ).toBeTruthy();
    fireEvent.change(screen.getByRole("slider", { name: "观察世代" }), {
      target: { value: "200" },
    });
    expect(screen.getByText("第 200 代")).toBeTruthy();
    fireEvent.change(screen.getByLabelText("模拟代数 T"), {
      target: { value: "20" },
    });
    expect(screen.queryByRole("img")).toBeNull();
    await user.click(screen.getByRole("button", { name: "重置实验" }));
    expect(
      (screen.getByLabelText("模拟代数 T") as HTMLInputElement).value,
    ).toBe("200");
  });
  it("does not silently coerce invalid counts after changing N", () => {
    render(<App />);
    fireEvent.change(screen.getByLabelText(/种群大小/), {
      target: { value: "10" },
    });
    expect(
      (screen.getByLabelText("初始 A 拷贝数 X₀") as HTMLInputElement).value,
    ).toBe("100");
    expect(
      (screen.getByRole("button", { name: /运行模拟/ }) as HTMLButtonElement)
        .disabled,
    ).toBe(true);
    fireEvent.change(screen.getByRole("slider", { name: /初始频率/ }), {
      target: { value: "10" },
    });
    expect(screen.getByText("0.5000")).toBeTruthy();
    expect(
      (screen.getByRole("button", { name: /运行模拟/ }) as HTMLButtonElement)
        .disabled,
    ).toBe(false);
  });
  it("keeps theory hidden by default and expands on request", async () => {
    const user = userEvent.setup();
    const { container } = render(<App />);
    expect(
      [...container.querySelectorAll("details")].every(
        (element) => !element.open,
      ),
    ).toBe(true);
    const summary = screen.getByText("理解中性 Wright–Fisher 模型");
    await user.click(summary);
    expect(summary.parentElement?.hasAttribute("open")).toBe(true);
  });
  it("renders every scientific formula without parse errors", () => {
    for (const content of Object.values(neutralContent))
      for (const item of content.mathematics) {
        if (item.formula)
          expect(() =>
            katex.renderToString(item.formula, { throwOnError: true }),
          ).not.toThrow();
      }
  });
});
