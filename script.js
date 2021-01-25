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

// ========================================

// Data clases

class Workout {
  // Instance/Public properites - New feature ***
  date = new Date();

  // Em aplicações reais usamos uma API pra gerar um ID unico para cada objeto criado
  id = (Date.now() + '').slice(-10); // Id = String com os ultimos 10 números de Date

  constructor(coords, distance, duration) {
    this.coords = coords; // [lat,lng]
    this.distance = distance; // km
    this.duration = duration; // min
  }
}

class Running extends Workout {
  type = 'running';
  constructor(coords, distance, duration, cadence) {
    super(coords, distance, duration);
    this.cadence = cadence;
    this.calcPace();
  }

  calcPace() {
    // min/km
    this.pace = this.duration / this.distance;
  }
}

class Cycling extends Workout {
  type = 'cycling';
  constructor(coords, distance, duration, elevationGain) {
    super(coords, distance, duration);
    this.calcSpeed();
    this.elevationGain = elevationGain;
  }

  calcSpeed() {
    // km / hr
    this.speed = Math.round(this.distance / (this.duration / 60));
  }
}

// ========================================

// App Class

class App {
  // Private Var
  #map;
  #mapEvent;
  #workouts = [];

  constructor() {
    // Display Map, assim que criarmos uma instância.
    this._getPosition(); // geolocation.getCurrentPosition + load map

    // Events

    // Disparar evento de submit toda vez que o usuário apertar enter em algum campo do form
    form.addEventListener('submit', this._newWorkout.bind(this));

    // Evento mudança de tipo de exercício
    inputType.addEventListener('change', this._toggleElevationField);
  }

  // Metodos que serão herdados por meio do prototype (App.protoype) - Instance Methods

  _getPosition() {
    // Para evitar possíveis erros em Browsers antigos, só chamamos o metodo getCurrentPosition se a API estiver disponível
    if (navigator.geolocation)
      navigator.geolocation.getCurrentPosition(this._loadMap.bind(this), () =>
        alert('Não foi possível encontrar sua localização')
      );
  }

  // Sucess Function - getCurrentPosition
  _loadMap(geoLocObj) {
    //   Destructuing Objects: Extrair dado de uma propriedade e armazenar em uma variável de mesmo nome
    const { latitude, longitude } = geoLocObj.coords;
    const position = [latitude, longitude];
    // Create a map in the 'map' div (l.map("div id"))
    this.#map = L.map('map').setView(position, 15);

    // Layout do mapa
    L.tileLayer('http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
      maxZoom: 20,
      subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
    }).addTo(this.#map);

    //  O metodo on da library funciona como o addEventListener
    this.#map.on('click', this._showForm.bind(this));
  }

  _showForm(mapE) {
    // Como queremos redefinir o valor da propriedade #mapEvent da instancia que foi criada pela class App, utiliza-se o metodo bind para setar o this, uma vez que esta apontando para o elemento o qual o evento esta ligado (this.#map)

    this.#mapEvent = mapE; // Objeto que contém coordenas do click no map

    // Display form
    form.classList.remove('hidden');
    inputDistance.focus();
  }

  _toggleElevationField() {
    inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
    inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
  }

  _newWorkout(e) {
    const validInputs = (...inputs) =>
      inputs.every(imp => Number.isFinite(imp));

    const allPositive = (...inputs) => inputs.every(imp => imp > 0);

    // Por padrão ao apertar enter em um form a página é recarregada
    e.preventDefault();

    // Get Data from form
    const type = inputType.value;
    const distance = +inputDistance.value;
    const duration = +inputDuration.value;
    const { lat, lng } = this.#mapEvent.latlng;
    let workout;

    if (type === 'running') {
      const cadence = +inputCadence.value;
      // Check if data is valid

      if (
        !validInputs(distance, duration, cadence) ||
        !allPositive(distance, duration, cadence)
      )
        return alert('Inputs have to be numbers');

      // Create an object + push
      workout = new Running([lat, lng], distance, duration, cadence);
    }

    if (type === 'cycling') {
      const elevation = +inputElevation.value;
      console.log(type);

      if (
        !validInputs(distance, duration) ||
        !allPositive(distance, duration) // Elevation Gain can be negative
      )
        return alert('Inputs have to be positive numbers');

      // Create an object + push
      workout = new Cycling([lat, lng], distance, duration, elevation);
    }

    // Add new workout to workouts array
    this.#workouts.push(workout);

    // Render Workout as a Marker
    this.renderWorkoutMarker(workout);

    // Hide form
    form.classList.add('hidden');

    // Show workout list
    // this._showWorkout();

    // limpar form
    inputDistance.value = inputDuration.value = inputCadence.value = inputElevation.value =
      '';
  }

  renderWorkoutMarker(workout) {
    L.marker(workout.coords)
      .addTo(this.#map)
      .bindPopup(
        L.popup({
          // Personalizar Popup
          maxWidth: 250,
          minWidth: 100,
          autoClose: false, // autoClose: fecha o popup toda vez que algum outro estiver aberto
          closeOnClick: false,
          className: `${workout.type}-popup`, // CSS class
        })
      )
      .setPopupContent(`Distance: ${workout.distance}`)
      .openPopup();
  }

  _showWorkout() {
    // Resetar container workouts
    containerWorkouts
      .querySelectorAll('.workout')
      .forEach(curWorkout => curWorkout.remove());

    // Show workouts
    this.workouts.forEach(function (curWorkout) {
      console.log(curWorkout);
      const HTML = `
      <li class="workout workout--${inputType}" data-id="1234567890">
          <h2 class="workout__title">Running on April 14</h2>
          <div class="workout__details">
            <span class="workout__icon">🏃‍♂️</span>
            <span class="workout__value">${curWorkout.distance}</span>
            <span class="workout__unit">km</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">⏱</span>
            <span class="workout__value">${curWorkout.duration}</span>
            <span class="workout__unit">min</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">⚡️</span>
            <span class="workout__value">${curWorkout.distance}</span>
            <span class="workout__unit">min/km</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">🦶🏼</span>
            <span class="workout__value">${curWorkout.pace}</span>
            <span class="workout__unit">spm</span>
          </div>
        </li>
    `;

      containerWorkouts.insertAdjacentHTML('beforeend', HTML);
    });
  }
}

// ========================================

// Running App

// Testando workout classes
// const run1 = new Running([15, 12], 2, 45, 55, 1000);
// const ciclista1 = new Cycling([15, 12], 2, 10, 2);
// console.log(run1);
// console.log(ciclista1);

const app = new App();
