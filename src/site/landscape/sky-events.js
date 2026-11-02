// Seconds on the visible scene clock. Hidden time never advances this schedule.
export function skyEvents(random = Math.random) {
  let time = 0, pulseAt = 0, meteorAt = 0, duration = 0;
  const state = { pulse: 0, center: 0, meteor: -1, side: 0 };
  function schedulePulse(after) {
    pulseAt = after + 3 + 4 * random();
    duration = 2 + 2 * random();
    state.center = (random() - 0.5) * 110;
  }
  schedulePulse(0);
  meteorAt = 25 + 10 * random();
  return (dt, pastEntrance, moving) => {
    state.pulse = 0;
    state.meteor = -1;
    if (!moving || !pastEntrance) return state;
    time += dt;
    if (time >= pulseAt + duration) schedulePulse(time);
    if (time >= pulseAt) state.pulse = Math.sin(Math.PI * (time - pulseAt) / duration) ** 2;
    const age = time - meteorAt;
    if (age >= 0.85) meteorAt = time + 25 + 15 * random();
    else if (age >= 0) {
      if (!state.side) state.side = random() < 0.5 ? -1 : 1;
      state.meteor = age / 0.85;
    } else state.side = 0;
    return state;
  };
}
