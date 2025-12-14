exports.calculateAmount = ({ startTime, endTime, rate, evRate, ev }) => {
  const diffMs = endTime - startTime;
  const hours = Math.ceil(diffMs / (1000 * 60 * 60)); // round up

  const base = hours * rate;
  const evCost = ev ? hours * evRate : 0;

  return {
    hours,
    total: base + evCost,
  };
};
