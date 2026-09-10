import type { NeutralResult } from "../simulation/result";
export function trajectoryData(result: NeutralResult) {
  const copies = 2 * result.parameters.populationSize;
  return result.trajectory.map((state) => ({
    ...state,
    frequency: state.alleleCount / copies,
  }));
}
