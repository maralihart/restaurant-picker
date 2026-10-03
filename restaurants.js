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
  takeout: service.startsWith("Both"),
  yelp: name === "Urban Hot Pot Mosaic"
    ? "https://www.yelp.com/biz/urban-hot-pot-mosaic-fairfax"
    : `https://www.yelp.com/search?${new URLSearchParams({
      find_desc: yelpName || name,
      find_loc: location.endsWith(", MD") ? "Rockville, MD" : `${location.split(", ").at(-1)}, VA`,
    })}`,
}));

export function filterRestaurants(list, { search = "", cuisine = "", distance = "", price = "", service = "" } = {}) {
  const query = search.trim().toLowerCase();
  return list.filter(restaurant =>
    (!query || `${restaurant.name} ${restaurant.cuisine} ${restaurant.location}`.toLowerCase().includes(query)) &&
    (!cuisine || restaurant.cuisine.toLowerCase().includes(cuisine.toLowerCase())) &&
    (!distance || restaurant.distance[1] <= Number(distance)) &&
    (!price || restaurant.priceLevels.includes(Number(price))) &&
    (service !== "takeout" || restaurant.takeout)
  );
}

export function chooseRestaurant(list, random = Math.random) {
  return list.length ? list[Math.floor(random() * list.length)] : null;
}

export function restaurantFilterUrl(filters, baseUrl) {
  const url = new URL(baseUrl);
  for (const name of ["search", "cuisine", "distance", "price", "service"]) {
    url.searchParams.delete(name);
    if (filters[name]) url.searchParams.set(name, filters[name]);
  }
  return url.href;
}

export function restaurantShareMessage(restaurant, filters, baseUrl) {
  return `Let's try ${restaurant.name}!\n\nAddress: ${restaurant.location}\n\nYelp: ${restaurant.yelp}\n\nDon't like this? Spin again at ${restaurantFilterUrl(filters, baseUrl)}`;
}
