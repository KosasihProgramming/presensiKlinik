export function konfersiJam(time12h) {
  const timePart = time12h.split(" ");
  const time = timePart[0].split(":");
  const period = timePart[1];

  let hour = parseInt(time[0]);
  if (period === "PM" && hour !== 12) {
    hour += 12;
  } else if (period === "AM" && hour === 12) {
    hour = 0;
  }

  const hour24 = hour.toString().padStart(2, "0");
  const minute = time[1].padStart(2, "0");

  const time24h = `${hour24}:${minute}`;

  return time24h;
}
