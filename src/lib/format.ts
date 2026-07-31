export function formatAgeRange(ageMin: number, ageMax: number) {
  return `Ages ${ageMin}–${ageMax}`;
}

export function formatSessionTime(start: Date, end: Date) {
  const dateFmt = new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
  const timeFmt = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
  return `${dateFmt.format(start)} · ${timeFmt.format(start)}–${timeFmt.format(end)}`;
}
