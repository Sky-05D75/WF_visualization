// @vitest-environment jsdom
import { afterEach, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import App from "../../src/app/App";
import { theoryContent } from "../../src/theory/TheoryDisclosure";
import katex from "katex";
afterEach(cleanup);
it("enables selection and mutation independently, validates active parameters, and resets modules", async () => {
  render(<App />);
  const selection = screen.getByRole("switch", {
    name: "自然选择 · Selection",
  });
  const mutation = screen.getByRole("switch", { name: "突变 · Mutation" });
  expect((selection as HTMLInputElement).checked).toBe(false);
  expect(screen.queryByLabelText("选择系数 s")).toBeNull();
  fireEvent.click(selection);
  fireEvent.change(screen.getByLabelText("选择系数 s"), {
    target: { value: "-1" },
  });
  expect(
    (screen.getByRole("button", { name: /运行模拟/ }) as HTMLButtonElement)
      .disabled,
  ).toBe(true);
  fireEvent.click(selection);
  expect(
    (screen.getByRole("button", { name: /运行模拟/ }) as HTMLButtonElement)
      .disabled,
  ).toBe(false);
  fireEvent.click(mutation);
  fireEvent.change(screen.getByLabelText("突变率 μ（A → a）"), {
    target: { value: "1" },
  });
  fireEvent.change(screen.getByLabelText("突变率 ν（a → A）"), {
    target: { value: "1" },
  });
  fireEvent.change(screen.getByLabelText("初始 A 拷贝数 X₀"), {
    target: { value: "0" },
  });
  fireEvent.change(screen.getByLabelText("轨迹数 R"), {
    target: { value: "1" },
  });
  fireEvent.change(screen.getByLabelText("模拟代数 T"), {
    target: { value: "1" },
  });
  fireEvent.click(screen.getByRole("button", { name: /运行模拟/ }));
  await screen.findByRole("img", {}, { timeout: 5000 });
  expect(document.querySelector(".frequency-line.fixed")).toBeTruthy();
  expect(screen.getByText(/首次到达丢失边界：第 0 代（非吸收）/)).toBeTruthy();
  expect(screen.getByText(/pₛₘ =/)).toBeTruthy();
  fireEvent.click(mutation);
  expect(screen.queryByRole("img")).toBeNull();
  fireEvent.click(screen.getByRole("button", { name: "重置实验" }));
  expect((selection as HTMLInputElement).checked).toBe(false);
  expect((mutation as HTMLInputElement).checked).toBe(false);
});
it("renders all v0.2 derivations without formula errors", () => {
  for (const content of Object.values(theoryContent))
    for (const item of content.mathematics)
      if (item.formula)
        expect(() =>
          katex.renderToString(item.formula, { throwOnError: true }),
        ).not.toThrow();
});
