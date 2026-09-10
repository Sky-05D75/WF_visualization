import katex from "katex";
export function MathFormula({ formula }: { formula: string }) {
  return (
    <div
      className="formula"
      dangerouslySetInnerHTML={{
        __html: katex.renderToString(formula, {
          displayMode: true,
          throwOnError: true,
          trust: false,
          output: "htmlAndMathml",
        }),
      }}
    />
  );
}
