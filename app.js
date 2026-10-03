import { restaurants, filterRestaurants, chooseRestaurant, restaurantShareUrl } from "./restaurants.js";

const filters = document.querySelector("#filters");
const wheel = document.querySelector("#wheel");
const wheelCenter = document.querySelector("#wheel-center");
const spinButton = document.querySelector("#spin-button");
const result = document.querySelector("#result");
const resultDialog = document.querySelector("#result-dialog");
const filterDialog = document.querySelector("#filter-dialog");
const filterButton = document.querySelector("#open-filters");
const tabs = [...document.querySelectorAll('[role="tab"]')];
let matches = restaurants;
let rotation = 0;
let spinning = false;
const svgNamespace = "http://www.w3.org/2000/svg";
const mobileFilters = window.matchMedia("(max-width: 700px)");

function element(tag, text, className) {
  const node = document.createElement(tag);
  if (text) node.textContent = text;
  if (className) node.className = className;
  return node;
}

function yelpLink(restaurant, text) {
  const link = element("a", text);
  link.href = restaurant.yelp;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  link.setAttribute("aria-label", `${restaurant.name} on Yelp (opens in a new tab)`);
  return link;
}

function drawWheel() {
  wheel.replaceChildren();
  wheel.style.transform = "rotate(0deg)";
  rotation = 0;
  const step = 360 / matches.length;
  const point = degrees => {
    const radians = degrees * Math.PI / 180;
    return [250 + 245 * Math.cos(radians), 250 + 245 * Math.sin(radians)];
  };
  matches.forEach((restaurant, index) => {
    const angle = index * step - 90;
    const slice = document.createElementNS(svgNamespace, matches.length === 1 ? "circle" : "path");
    if (matches.length === 1) {
      slice.setAttribute("cx", 250);
      slice.setAttribute("cy", 250);
      slice.setAttribute("r", 245);
    } else {
      slice.setAttribute("d", `M250,250 L${point(angle - step / 2)} A245,245 0 ${step > 180 ? 1 : 0},1 ${point(angle + step / 2)} Z`);
    }
    slice.setAttribute("class", `wheel-slice wheel-color-${index % 6}`);
    const title = document.createElementNS(svgNamespace, "title");
    title.textContent = restaurant.name;
    slice.append(title);
    const label = document.createElementNS(svgNamespace, "text");
    label.setAttribute("class", "wheel-label");
    label.setAttribute("text-anchor", "middle");
    label.setAttribute("dominant-baseline", "middle");
    label.setAttribute("transform", `translate(${point(angle).map(value => 250 + (value - 250) * .65).join(" ")}) rotate(${angle > 90 ? angle + 180 : angle})`);
    label.textContent = restaurant.name.length > 17 ? `${restaurant.name.slice(0, 16)}…` : restaurant.name;
    wheel.append(slice, label);
  });
  wheel.setAttribute("aria-label", matches.length ? `Wheel with ${matches.length} matching restaurants. Each has an equal chance.` : "No matching restaurants");
}

function renderTable() {
  const rows = matches.map(restaurant => {
    const row = element("tr");
    const name = element("th", restaurant.name);
    name.scope = "row";
    row.append(name);
    for (const field of ["distanceLabel", "cuisine", "price", "hours", "location", "service"]) {
      row.append(element("td", restaurant[field]));
    }
    const linkCell = element("td");
    linkCell.append(yelpLink(restaurant, "View ↗"));
    row.append(linkCell);
    return row;
  });
  document.querySelector("#restaurant-rows").replaceChildren(...rows);
  document.querySelector("#table-empty").hidden = matches.length > 0;
}

function showResult(restaurant) {
  result.replaceChildren();
  const heading = element("h2", restaurant.name);
  heading.id = "result-title";
  result.append(element("p", "YOUR NEXT STOP", "eyebrow"), heading, element("p", restaurant.cuisine, "result-cuisine"));
  const tags = element("div", "", "result-tags");
  tags.append(element("span", restaurant.distanceLabel), element("span", restaurant.price));
  const details = element("dl", "", "result-details");
  for (const [label, value] of [["Find it", restaurant.location], ["Hours", restaurant.hours], ["Dining", restaurant.service]]) {
    details.append(element("dt", label), element("dd", value));
  }
  const link = yelpLink(restaurant, "Check it out on Yelp ↗");
  link.className = "result-link";
  const share = element("a", "Text a friend ✉", "share-link");
  share.href = restaurantShareUrl(restaurant);
  result.append(tags, details, link, share);
  resultDialog.showModal();
}

function update() {
  if (spinning) return;
  matches = filterRestaurants(restaurants, Object.fromEntries(new FormData(filters)));
  document.querySelector("#match-count").textContent = `${matches.length} of ${restaurants.length} spots`;
  spinButton.disabled = matches.length === 0;
  wheelCenter.disabled = matches.length === 0;
  document.querySelector("#spin-note").textContent = matches.length
    ? "Every spot has an equal shot. Trust the wheel."
    : "No matches. Broaden your filters to bring dinner back.";
  result.replaceChildren(element("h2", matches.length ? "Your next bite awaits." : "Nothing on the menu…"),
    element("p", matches.length ? "Give the wheel a spin. We'll pick from the spots that match your mood." : "Try a wider search or reset your filters."));
  drawWheel();
  renderTable();
}

const cuisineOptions = ["Afghan", "American", "Asian", "Chinese", "Halal", "Indian", "Korean", "Lebanese", "Mexican", "Middle Eastern", "Pakistani", "Palestinian", "Pizza", "Taiwanese", "Turkish", "Vegetarian", "Vietnamese"];
for (const cuisine of cuisineOptions) {
  const option = element("option", cuisine);
  option.value = cuisine;
  filters.elements.cuisine.append(option);
}
filters.addEventListener("submit", event => event.preventDefault());
filters.addEventListener("input", update);
filters.addEventListener("reset", () => setTimeout(update, 0));
function syncFilterDialog() {
  if (mobileFilters.matches) {
    if (filterDialog.open) filterDialog.close();
  } else if (!filterDialog.open) {
    filterDialog.show();
  }
}
syncFilterDialog();
mobileFilters.addEventListener("change", syncFilterDialog);
filterButton.addEventListener("click", () => filterDialog.showModal());
document.querySelector("#close-filters").addEventListener("click", () => filterDialog.close());

function activateTab(tab) {
  for (const item of tabs) {
    const selected = item === tab;
    item.setAttribute("aria-selected", selected);
    item.tabIndex = selected ? 0 : -1;
    document.getElementById(item.getAttribute("aria-controls")).hidden = !selected;
  }
}
tabs.forEach((tab, index) => {
  tab.addEventListener("click", () => activateTab(tab));
  tab.addEventListener("keydown", event => {
    let next;
    if (event.key === "ArrowRight") next = tabs[(index + 1) % tabs.length];
    if (event.key === "ArrowLeft") next = tabs[(index + tabs.length - 1) % tabs.length];
    if (event.key === "Home") next = tabs[0];
    if (event.key === "End") next = tabs.at(-1);
    if (next) {
      event.preventDefault();
      activateTab(next);
      next.focus();
    }
  });
});

function spin() {
  if (spinning || !matches.length) return;
  const restaurant = chooseRestaurant(matches);
  const index = matches.indexOf(restaurant);
  const target = (360 - index * 360 / matches.length) % 360;
  rotation += 360 * 5 + (target - rotation % 360 + 360) % 360;
  spinning = true;
  spinButton.disabled = true;
  wheelCenter.disabled = true;
  spinButton.textContent = "Deciding dinner…";
  for (const control of filters.elements) control.disabled = true;
  result.replaceChildren(element("h2", "Round and round…"), element("p", "One good dinner, coming right up."));
  wheel.style.transform = `rotate(${rotation}deg)`;
  const finish = () => {
    spinning = false;
    spinButton.disabled = false;
    wheelCenter.disabled = false;
    spinButton.textContent = "Spin again ↻";
    for (const control of filters.elements) control.disabled = false;
    showResult(restaurant);
  };
  setTimeout(finish, window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 3900);
}
spinButton.addEventListener("click", spin);
wheelCenter.addEventListener("click", spin);
document.querySelector("#close-result").addEventListener("click", () => resultDialog.close());

drawWheel();
renderTable();
document.querySelector("#match-count").textContent = `${restaurants.length} of ${restaurants.length} spots`;
