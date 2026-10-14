// API-token estimate only: seat licences and non-token charges are separate.
export function calculateApiCost(values) {
  const limits = {
    developers: [0, 100000, true], tasks: [0, 1000, true], days: [1, 31, true],
    runs: [1, 100], input: [0, 1e9, true], output: [0, 1e9, true],
    inputRate: [0, 1e6], outputRate: [0, 1e6], cachedRate: [0, 1e6], cache: [0, 100]
  };
  for (const [key, [min, max, integer]] of Object.entries(limits)) {
    const value = values[key];
    if (!Number.isFinite(value) || value < min || value > max || (integer && !Number.isInteger(value))) {
      throw new RangeError(`Invalid ${key}`);
    }
  }
  const tasks = values.developers * values.tasks * values.days;
  const runs = tasks * values.runs;
  const input = runs * values.input;
  const output = runs * values.output;
  const cachedInput = input * values.cache / 100;
  const inputCost = ((input - cachedInput) * values.inputRate + cachedInput * values.cachedRate) / 1e6;
  const outputCost = output * values.outputRate / 1e6;
  const total = inputCost + outputCost;
  return {tasks, runs, input, output, cachedInput, inputCost, outputCost, total, perTask: tasks ? total / tasks : null};
}
