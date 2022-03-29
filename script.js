'use strict';

// prettier-ignore

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
  _setDescription() {
    const months = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];
    this.description = `${this.type[0].toUpperCase()}${this.type.slice(1)} on ${
      months[this.date.getMonth()]
    } ${this.date.getDate()}
    `;
  }
}

class Running extends Workout {
  type = 'running';
  constructor(distance, duration, coords, cadence) {
    super(distance, duration, coords);
    this.cadence = cadence;
    this.calcPace();
    this._setDescription();
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
    this._setDescription();
  }
  calcSpeed() {
    this.speed = this.distance / (this.duration / 60);
    return this.speed;
  }
}

// const running1 = new Running(10, 47, [22, -55], 178);
// const cycling1 = new Cycling(10, 14, [22, -55], 523);

// App Class
class App {
  #map;
  #eventMap;
  #workout = [];
  constructor() {
    this._getPosition();

    form.addEventListener('submit', this._newWorkout.bind(this));

    inputType.addEventListener('change', this._toggleElevetionField);

    containerWorkouts.addEventListener('click', this._movePopup.bind(this));

    this._getLocalStorage();
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

    this.#workout.forEach(el => {
      this._renderWorkoutMaker(el);
    });
  }

  _showForm(e) {
    this.#eventMap = e;
    form.classList.remove('hidden');
    form.style.display = 'grid';
    inputDistance.focus();
  }

  _hideForm() {
    //Clear
    inputDistance.value =
      inputDuration.value =
      inputCadence.value =
      inputElevation.value =
        '';
    form.style.display = 'none';
    form.classList.add('hidden');
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

    //Render workout on map as marker
    this._renderWorkoutMaker(workouts);

    //Render workout on list
    this._renderWorkout(workouts);

    //Set LocalStorage
    this._setLocalStorage();

    //Hide and Clear fields
    this._hideForm();
  }

  _renderWorkoutMaker(workout) {
    console.log(workout);
    L.marker(workout.coords, {
      riseOnHover: true,
      opacity: 1,
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
          `${workout.type === 'running' ? '🏃‍♂️' : '🚴‍♀️'} ${workout.description}`
        )
      )
      .openPopup();
  }
  _renderWorkout(workout) {
    let html = ` 
    <li class="workout workout--${workout.type}" data-id="${workout.id}">
        <h2 class="workout__title">${workout.description}</h2>
        <div class="workout__details">
          <span class="workout__icon">${
            workout.type === 'running' ? '🏃‍♂️' : '🚴‍♀️'
          }</span>
          <span class="workout__value">${workout.distance}</span>
          <span class="workout__unit">km</span>
        </div>
      <div class="workout__details">
        <span class="workout__icon">⏱</span>
        <span class="workout__value">${workout.duration}</span>
        <span class="workout__unit">min</span>
      </div>`;
    if (workout.type === 'running') {
      html += ` 
      <div class="workout__details">
        <span class="workout__icon">⚡️</span>
        <span class="workout__value">${workout.pace.toFixed(1)}</span>
        <span class="workout__unit">min/km</span>
      </div>
      <div class="workout__details">
        <span class="workout__icon">🦶🏼</span>
        <span class="workout__value">${workout.cadence}</span>
        <span class="workout__unit">spm</span>
      </div>
    </li>`;
    }
    if (workout.type === 'cycling') {
      html += ` 
      <div class="workout__details">
        <span class="workout__icon">⚡️</span>
        <span class="workout__value">${workout.speed.toFixed(1)}</span>
        <span class="workout__unit">km/h</span>
      </div>
      <div class="workout__details">
        <span class="workout__icon">⛰</span>
        <span class="workout__value">${workout.elevation}</span>
        <span class="workout__unit">m</span>
      </div>
    </li>`;
    }

    form.insertAdjacentHTML('afterend', html);
  }
  _movePopup(e) {
    const workoutEl = e.target.closest('.workout');
    console.log(workoutEl);
    if (!workoutEl) return;

    const workoutE = this.#workout.find(
      work => work.id === workoutEl.dataset.id
    );
    console.log(workoutE);
    this.#map.setView(workoutE.coords, 18, {
      animate: true,
      pan: {
        duration: 1,
      },
    });
  }
  _setLocalStorage() {
    localStorage.setItem('workouts', JSON.stringify(this.#workout));
  }
  _getLocalStorage() {
    const data = JSON.parse(localStorage.getItem('workouts'));
    if (!data) return;
    console.log(data);
    this.#workout = data;

    this.#workout.forEach(el => {
      this._renderWorkout(el);
    });
  }

  reset() {
    localStorage.removeItem('workouts');
    location.reload();
  }
}
const magicMap = new App();
