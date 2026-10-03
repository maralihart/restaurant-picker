import test from "node:test";
import assert from "node:assert/strict";
import { restaurants, filterRestaurants, chooseRestaurant, restaurantShareUrl } from "./restaurants.js";

test("all 18 supplied restaurants have complete details and safe Yelp links", () => {
  assert.equal(restaurants.length, 18);
  assert.equal(new Set(restaurants.map(restaurant => restaurant.name)).size, 18);
  for (const restaurant of restaurants) {
    for (const field of ["name", "cuisine", "price", "hours", "location", "service", "distanceLabel"]) {
      assert.ok(restaurant[field], `${restaurant.name}: ${field}`);
    }
    assert.equal(new URL(restaurant.yelp).origin, "https://www.yelp.com");
    assert.ok(restaurant.distance[0] < restaurant.distance[1]);
  }
  assert.equal(new URL(restaurants.at(-1).yelp).searchParams.get("find_loc"), "Rockville, MD");
});

test("empty filters preserve the whole lineup and search ignores case and whitespace", () => {
  assert.deepEqual(filterRestaurants(restaurants), restaurants);
  assert.equal(filterRestaurants(restaurants, { search: "  CHIKO " })[0].name, "CHIKO");
  assert.equal(filterRestaurants(restaurants, { search: "Chantilly" })[0].name, "Cozmo One");
  assert.equal(filterRestaurants(restaurants, { search: "vegetarian" })[0].name, "Tulsi Pure Veg Restaurant");
});

test("distance uses the upper end of approximate ranges", () => {
  assert.equal(filterRestaurants(restaurants, { distance: "3" }).length, 2);
  assert.equal(filterRestaurants(restaurants, { distance: "5" }).length, 7);
  assert.equal(filterRestaurants(restaurants, { distance: "6" }).length, 9);
  assert.equal(filterRestaurants(restaurants, { distance: "25" }).length, 18);
});

test("price ranges match each included level and dining excludes eat-in-only spots", () => {
  assert.deepEqual(filterRestaurants(restaurants, { price: "1" }).map(item => item.name), ["Falafel Inc", "Noosh Grill", "La Tingeria"]);
  assert.ok(filterRestaurants(restaurants, { price: "3" }).some(item => item.name === "Local Provisions"));
  assert.equal(filterRestaurants(restaurants, { price: "4" })[0].name, "Heirloom");
  assert.equal(filterRestaurants(restaurants, { service: "takeout" }).length, 16);
  assert.equal(filterRestaurants(restaurants, { service: "eat-in" }).length, 18);
});

test("filters combine and impossible combinations return an empty list", () => {
  const matches = filterRestaurants(restaurants, { cuisine: "Korean", distance: "5", price: "2", service: "takeout" });
  assert.deepEqual(matches.map(item => item.name), ["ChiMc", "CHIKO"]);
  assert.deepEqual(filterRestaurants(restaurants, { cuisine: "Vietnamese", price: "4" }), []);
  assert.deepEqual(filterRestaurants(restaurants, { search: "no such restaurant" }), []);
});

test("selection handles zero, one, and every possible matching restaurant", () => {
  assert.equal(chooseRestaurant([]), null);
  assert.equal(chooseRestaurant([restaurants[0]]), restaurants[0]);
  const matches = filterRestaurants(restaurants, { cuisine: "Korean" });
  for (let index = 0; index < matches.length; index++) {
    assert.equal(chooseRestaurant(matches, () => (index + .5) / matches.length), matches[index]);
  }
  assert.equal(chooseRestaurant(restaurants, () => 0), restaurants[0]);
  assert.equal(chooseRestaurant(restaurants, () => .999999), restaurants.at(-1));
});

test("text share link includes the restaurant name, address, and Yelp URL", () => {
  const restaurant = restaurants[0];
  const shareUrl = new URL(restaurantShareUrl(restaurant));
  const message = shareUrl.searchParams.get("body");
  assert.equal(shareUrl.protocol, "sms:");
  assert.ok(message.includes(restaurant.name));
  assert.ok(message.includes(restaurant.location));
  assert.ok(message.includes(restaurant.yelp));
});
