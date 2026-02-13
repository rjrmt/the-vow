/**
 * ModuleController reducer - state machine for module navigation
 */

export type ModuleId =
  | "home"
  | "dopamine-deck"
  | "pulse-sync"
  | "memory-loom"
  | "affirmation-orbit"
  | "coop-canvas"
  | "reveal";

export type ModuleControllerAction =
  | { type: "NAVIGATE"; payload: ModuleId }
  | { type: "BACK" }
  | { type: "RESET" };

export interface ModuleControllerState {
  current: ModuleId;
  history: ModuleId[];
}

const INITIAL: ModuleControllerState = {
  current: "home",
  history: [],
};

export function moduleControllerReducer(
  state: ModuleControllerState,
  action: ModuleControllerAction
): ModuleControllerState {
  switch (action.type) {
    case "NAVIGATE":
      return {
        current: action.payload,
        history: state.history.concat(state.current),
      };
    case "BACK":
      if (state.history.length === 0) return state;
      const [next, ...rest] = state.history.slice().reverse();
      return {
        current: next,
        history: rest.reverse(),
      };
    case "RESET":
      return INITIAL;
    default:
      return state;
  }
}

export const initialModuleState = INITIAL;
