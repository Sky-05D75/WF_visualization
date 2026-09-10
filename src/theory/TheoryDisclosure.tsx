import { memo } from "react";
import { neutralContent, type TheoryId } from "./neutralContent";
import { MathFormula } from "./MathFormula";
export const TheoryDisclosure = memo(function TheoryDisclosure({
  theoryId,
}: {
  theoryId: TheoryId;
}) {
  const content = neutralContent[theoryId];
  return (
    <details className="theory">
      <summary>理解{content.title}</summary>
      <div className="theory-body">
        <h4>生物学解释</h4>
        {content.biology.map((text) => (
          <p key={text}>{text}</p>
        ))}
        <details className="derivation">
          <summary>数学定义与推导</summary>
          {content.mathematics.map(({ text, formula }) => (
            <div key={text}>
              <p>{text}</p>
              {formula && <MathFormula formula={formula} />}
            </div>
          ))}
        </details>
      </div>
    </details>
  );
});
