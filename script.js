'use strict';

// prettier-ignore
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');

let latitude = 0;
let longitude = 0;
if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(function (e) {
    latitude = e.coords.latitude;
    longitude = e.coords.longitude;

    const map = L.map('map').setView([latitude, longitude], 18);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);
    // create a red polyline from an array of LatLng points
    var latlngs = [
      [latitude, longitude],
      [latitude + 1, longitude - 1],
      [latitude + 1, longitude - 1],
    ];

    map.on('click', function (e) {
      console.log(e);
      L.marker([e.latlng.lat, e.latlng.lng], {
        riseOnHover: true,
        opacity: 1,
        draggable: true,
      })
        .addTo(map)
        .bindPopup(
          L.popup({
            maxWidth: 300,
            minWidth: 100,
            autoClose: false,
            closeOnClick: false,
            className: 'running-popup',
          })
            .setLatLng([e.latlng.lat, e.latlng.lng])
            .setContent('Working')
            .openOn(map)
        )
        .openPopup();
    });
    // zoom the map to the polyline

    L.circle([latitude, longitude], { radius: 20 }).addTo(map);
  });
} else {
  alert('San ruxsat bermading!!');
}
// setTimeout(function () {
//   console.log(latitude, longitude);
// }, 3000);
