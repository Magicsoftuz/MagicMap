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
let map;
let eventMap;

class Workout {
  date = new Date();
  id = (Date.now() + '').slice(-10);

  constructor(distance, duration, coords) {
    this.distance = distance; // km
    this.duration = duration; // min
    this.coords = coords; // [23,-44.5]
  }
}

class Running extends Workout {
  type = 'running';
  constructor(distance, duration, coords, cadence) {
    super(distance, duration, coords);
    this.cadence = cadence;
    this.calcPace();
  }
  calcPace() {
    this.pace = this.duration / this.distance;
    return this.pace;
  }
}
class Cycling extends Workout {
  type = 'cycling';
  constructor(distance, duration, coords, elevation) {
    super(distance, duration, coords);
    this.elevation = elevation;
    this.calcSpeed();
  }
  calcSpeed() {
    this.speed = this.distance / (this.duration / 60);
    return this.speed;
  }
}

const running1 = new Running(10, 47, [22, -55], 178);
const cycling1 = new Cycling(10, 14, [22, -55], 523);
console.log(running1, cycling1);

// App Class
class App {
  #map;
  #eventMap;
  #workout = [];
  constructor() {
    this._getPosition();

    form.addEventListener('submit', this._newWorkout.bind(this));

    inputType.addEventListener('change', this._toggleElevetionField);
  }

  _getPosition() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        this._loadMap.bind(this),
        function () {
          alert('Geolocation not working!');
        }
      );
    }
  }

  _loadMap(e) {
    latitude = e.coords.latitude;
    longitude = e.coords.longitude;

    this.#map = L.map('map').setView([latitude, longitude], 18);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);

    this.#map.on('click', this._showForm.bind(this));

    L.circle([latitude, longitude], { radius: 20 }).addTo(this.#map);
  }

  _showForm(e) {
    this.#eventMap = e;
    form.classList.remove('hidden');
    inputDistance.focus();
  }

  _toggleElevetionField() {
    inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
    inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
  }

  _newWorkout(e) {
    e.preventDefault();
    const isNumberOr = (...input) => {
      return input.every(val => Number.isFinite(val));
    };
    const allPositive = (...input) => {
      return input.every(val => val > 0);
    };

    // Get data from FROM
    const type = inputType.value;
    const distance = +inputDistance.value;
    const duration = +inputDuration.value;
    let workouts;
    //Check if data is valid

    //if workout running, create running object
    if (type == 'running') {
      const cadence = +inputCadence.value;

      if (
        !isNumberOr(distance, duration, cadence) &&
        !allPositive(distance, duration, cadence)
      ) {
        return alert('You must enter positive Number');
      }
      workouts = new Running(
        distance,
        duration,
        [this.#eventMap.latlng.lat, this.#eventMap.latlng.lng],
        cadence
      );
    }
    //if workout cycling, create cycling object
    if (type == 'cycling') {
      const elevation = +inputElevation.value;
      if (
        !isNumberOr(distance, duration, elevation) &&
        !allPositive(distance, duration, elevation)
      ) {
        return alert('You must enter positive Number');
      }

      workouts = new Cycling(
        distance,
        duration,
        [this.#eventMap.latlng.lat, this.#eventMap.latlng.lng],
        elevation
      );
    }
    //Add new object to workout array
    this.#workout.push(workouts);
    console.log(this.#workout);

    //Render workout on map as marker
    this.renderWorkoutMaker(workouts);
    //Render workout on list

    //Hide and Clear fields
    inputDistance.value =
      inputDuration.value =
      inputCadence.value =
      inputElevation.value =
        '';
  }

  renderWorkoutMaker(workout) {
    L.marker([this.#eventMap.latlng.lat, this.#eventMap.latlng.lng], {
      riseOnHover: true,
      opacity: 0.5,
      draggable: true,
    })
      .addTo(this.#map)
      .bindPopup(
        L.popup({
          maxWidth: 250,
          minWidth: 50,
          autoClose: false,
          closeOnClick: false,
          className: `${workout.type}-popup`,
        }).setContent(
          `${
            workout.type
          } - ${workout.date.getFullYear()}/${workout.date.getMonth()}`
        )
      )
      .openPopup();
  }
}
const magicMap = new App();
