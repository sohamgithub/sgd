
navigator.geolocation.getCurrentPosition(successLocation, errorLocation, {
  enableHighAccuracy: true
})
function successLocation(position) {
  var latitude= position.coords.latitude;
  var longitude =  position.coords.longitude;
}

function errorLocation() {

}

module.exports = {
  lat: latitude,
  long: longitude

}
