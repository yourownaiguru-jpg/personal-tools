// Validated categorical/status palette (dark-mode steps), from the dataviz
// skill's reference palette. Slots 1 and 3 are used together here — both
// sit within the first three slots, which validate as a safe pair under
// simulated color-vision deficiency in both light and dark mode.
export const CHART_COLORS = {
  blue: '#3987e5', // categorical slot 1 — primary series (expenses)
  aqua: '#199e70', // categorical slot 3 — secondary series (income)
  red: '#e66767', // status: overspend / negative delta
  green: '#0ca30c', // status: positive delta
  gray: '#898781', // muted ink / axis
  grid: '#2c2c2a', // hairline gridlines on dark surface
} as const
