const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function parseClock(value, closing, openingMinute = 0) {
  const [hour, minute = "0"] = value.split(":").map(Number);
  if (!closing) return (hour === 12 ? 12 : hour <= 6 ? hour + 12 : hour) * 60 + minute;
  if (hour === 12) return openingMinute >= 16 * 60 ? 24 * 60 : 12 * 60;
  return (hour <= 11 ? hour + 12 : hour) * 60 + minute;
}

function parseOpeningHours(hours) {
  const schedule = Array.from({ length: 7 }, () => []);
  for (const clause of hours.split(";")) {
    const text = clause.trim();
    const firstTime = text.search(/~?\d{1,2}(?::\d{2})?(?:\/\d{1,2}(?::\d{2})?)?–/);
    if (firstTime < 0) continue;
    const dayLabel = text.slice(0, firstTime).trim();
    const hoursText = text.slice(firstTime).replaceAll("~", "");
    const days = dayLabel === "Daily"
      ? dayNames.map((_, index) => index)
      : dayLabel.split(", ").flatMap(range => {
        const [first, last = first] = range.split("–");
        const start = dayNames.indexOf(first);
        const end = dayNames.indexOf(last);
        if (start < 0 || end < 0) return [];
        const result = [];
        for (let day = start; day !== -1; day = (day + 1) % 7) {
          result.push(day);
          if (day === end) break;
        }
        return result;
      });
    for (const range of hoursText.split(" & ")) {
      const times = range.matchAll(/(\d{1,2}(?::\d{2})?(?:\/\d{1,2}(?::\d{2})?)?)–(\d{1,2}(?::\d{2})?)/g);
      for (const [, opens, closes] of times) {
        const openingTimes = opens.split("/");
        for (const [index, day] of days.entries()) {
          const openingMinute = parseClock(openingTimes[index] || openingTimes[0], false);
          const closingMinute = parseClock(closes, true, openingMinute);
          schedule[day].push([openingMinute, closingMinute]);
        }
      }
    }
  }
  return schedule;
}

const entries = [
  ["Saigon Bistro", "Vietnamese", [2], "$$ · ~$15–25", "Mon, Wed–Sun 11–9; Tue closed", "47100 Community Plaza #124, Sterling", "Both", [0, 3]],
  ["Laziz Kabob & Karahi", "Afghan / Pakistani / Middle Eastern", [2], "$$ · ~$16–30", "Sun 10–10; Mon–Thu 11–10; Fri–Sat 10–10:30", "47100 Community Plaza #114, Sterling", "Both", [0, 3], "Laziz Kabob"],
  ["Champs Pizza", "Pizza / American / Halal", [2], "$$ · ~$12–25", "Mon–Thu, Sun 11–9; Fri–Sat 11–10", "45630 Falke Plaza #190, Sterling", "Both; mostly takeout", [3, 5]],
  ["ChiMc", "Korean fried chicken", [2], "$$ · ~$15–30", "Daily 11:30–9:30", "21950 Cascades Pkwy #155, Sterling", "Both", [3, 5]],
  ["Local Provisions", "New American / farm-to-table", [2, 3], "$$–$$$ · ~$20–40", "Mon–Thu 11–2:30 & 4:30–8:30; Fri–Sat 11–9:30; Sun 10–8", "46286 Cranston St, Sterling", "Both", [3, 5]],
  ["CHIKO", "Chinese / Korean / Asian fusion", [2], "$$ · ~$15–25", "Daily ~12–8", "46308 Cranston St, Potomac Falls", "Both", [3, 5]],
  ["INJU Korean Grill", "Korean BBQ", [3], "$$$ · ~$35–60+", "Daily 11:30–10", "46300 Cranston St, Sterling", "Both; primarily eat-in", [3, 5]],
  ["Ms. Peach's", "Southern American / brunch", [2, 3], "$$–$$$ · ~$20–40", "Tue–Thu 4–10; Fri 11:30–10; Sat 9–10; Sun 9–9", "20789 Great Falls Plaza #176, Sterling", "Both", [4, 6], "Ms Peach's"],
  ["Cozmo One", "Turkish / Middle Eastern", [2], "$$ · ~$13–35", "Daily ~8–9", "14201 Sullyfield Cir #100, Chantilly", "Both", [5, 6]],
  ["Falafel Inc", "Palestinian / Middle Eastern", [1], "$ · ~$5–15", "Mon–Thu, Sun 11–9; Fri–Sat 11–10", "20548 Easthampton Plaza, Ashburn", "Both", [6, 8]],
  ["Yen's Cafe", "Taiwanese / Chinese", [2], "$$ · ~$15–25", "Mon closed; Tue–Fri 4–9; Sat–Sun 10:30/11–9", "43490 Yukon Dr #113, Ashburn", "Both", [6, 8]],
  ["Tulsi Pure Veg Restaurant", "Indian — 100% vegetarian", [2], "$$ · ~$10–20", "Mon, Wed–Sun 11–3:30 & 5–10; Tue closed", "1114 Herndon Pkwy, Herndon", "Both", [7, 9]],
  ["Zamarod", "Afghan / Halal", [2, 3], "$$–$$$ · ~$20–35", "Mon–Sat 11:30–2:30 & 5–10; Sun 5–8", "10123 Colvin Run Rd, Great Falls", "Both", [8, 10], "Zamarod Restaurant"],
  ["Heirloom", "Modern American / Mediterranean-influenced", [4], "$$$$ · $50+", "Mon 4–10; Tue–Thu 4–11; Fri–Sat 4–12; Sun 4–9", "1871 Fountain Dr #300, Reston", "Eat-in primarily", [10, 12]],
  ["Urban Hot Pot Mosaic", "Chinese / Asian hot pot", [3], "$$$ · ~$25–40+ AYCE", "Sun–Thu 12–10:30; Fri–Sat 12–11:30", "2980 District Ave #110, Fairfax", "Eat-in", [12, 15]],
  ["Noosh Grill", "Afghan-American / burgers / bowls", [1, 2], "$–$$ · ~$10–20", "Daily 11–10", "9573 Braddock Rd, Fairfax", "Both", [13, 15]],
  ["La Tingeria", "Mexican / Halal", [1, 2], "$–$$ · ~$10–20", "Mon closed; Tue–Sat 11–9; Sun 11–8", "626 S Washington St, Falls Church", "Both", [18, 20]],
  ["Z&Z Manakeesh", "Lebanese / Palestinian / Middle Eastern bakery", [2], "$$ · ~$10–20", "Mon–Tue closed; Wed–Sat 10–8; Sun 10–3", "1111 Nelson St, Rockville, MD", "Both; counter service", [22, 25], "Z&Z Manakeesh"],
];

export const restaurants = entries.map(([name, cuisine, priceLevels, price, hours, location, service, distance, yelpName]) => ({
  name, cuisine, priceLevels, price, hours, location, service, distance,
  distanceLabel: `~${distance[0]}–${distance[1]} mi`,
  openingHours: parseOpeningHours(hours),
  takeout: service.startsWith("Both"),
  yelp: name === "Urban Hot Pot Mosaic"
    ? "https://www.yelp.com/biz/urban-hot-pot-mosaic-fairfax"
    : `https://www.yelp.com/search?${new URLSearchParams({
      find_desc: yelpName || name,
      find_loc: location.endsWith(", MD") ? "Rockville, MD" : `${location.split(", ").at(-1)}, VA`,
    })}`,
}));

export function filterRestaurants(list, { search = "", cuisine = "", distance = "", price = "", service = "", openNow = "", time = "", now = new Date() } = {}) {
  const query = search.trim().toLowerCase();
  const isOpenAt = (restaurant, date, minute) => restaurant.openingHours[date.getDay()]
    .some(([opens, closes]) => opens <= minute && minute < closes);
  const timeMatch = time.match(/^(\d{2}):(\d{2})$/);
  const timeIsValid = !timeMatch || (Number(timeMatch[1]) < 24 && Number(timeMatch[2]) < 60);
  const timeMinute = timeMatch ? Number(timeMatch[1]) * 60 + Number(timeMatch[2]) : 0;
  const nowMinute = now.getHours() * 60 + now.getMinutes();
  return list.filter(restaurant =>
    (!query || `${restaurant.name} ${restaurant.cuisine} ${restaurant.location}`.toLowerCase().includes(query)) &&
    (!cuisine || restaurant.cuisine.toLowerCase().includes(cuisine.toLowerCase())) &&
    (!distance || restaurant.distance[1] <= Number(distance)) &&
    (!price || restaurant.priceLevels.includes(Number(price))) &&
    (service !== "takeout" || restaurant.takeout) &&
    (!openNow || isOpenAt(restaurant, now, nowMinute)) &&
    (!time || (timeIsValid && isOpenAt(restaurant, now, timeMinute)))
  );
}

export function chooseRestaurant(list, random = Math.random) {
  return list.length ? list[Math.floor(random() * list.length)] : null;
}

export function restaurantFilterUrl(filters, baseUrl) {
  const url = new URL(baseUrl);
  for (const name of ["search", "cuisine", "distance", "price", "service", "openNow", "time"]) {
    url.searchParams.delete(name);
    if (filters[name]) url.searchParams.set(name, filters[name] === "on" ? "true" : filters[name]);
  }
  return url.href;
}

export function restaurantShareMessage(restaurant, filters, baseUrl) {
  return `Let's try ${restaurant.name}!\n\nAddress: ${restaurant.location}\n\nYelp: ${restaurant.yelp}\n\nDon't like this? Spin again at ${restaurantFilterUrl(filters, baseUrl)}`;
}
