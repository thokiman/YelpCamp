//runs second: mapboxgl.accessToken running from show.ejs campgrounds
mapboxgl.accessToken = mapToken;
const map = new mapboxgl.Map({
  container: "map",
  style: "mapbox://styles/mapbox/dark-v10", // stylesheet location
  center: campground.geometry.coordinates, // starting position [lng, lat]
  zoom: 4, // starting zoom
});
// Add zoom and rotation controls to the map.
map.addControl(new mapboxgl.NavigationControl());
new mapboxgl.Marker()
  .setLngLat(campground.geometry.coordinates) //longitude and latitude, x,y
  .setPopup(
    new mapboxgl.Popup({
      offset: 25,
    }).setHTML(`<h3>${campground.title}</h3><p>${campground.location}</p>`)
  ) //adding popup marker
  .addTo(map); //adding marker to map variable
