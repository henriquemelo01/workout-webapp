'use strict';

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
  click = 0;

  // Em aplicações reais usamos uma API pra gerar um ID unico para cada objeto criado
  id = (Date.now() + '').slice(-10); // Id = String com os ultimos 10 números de Date

  constructor(coords, distance, duration) {
    this.coords = coords; // [lat,lng]
    this.distance = distance; // km
    this.duration = duration; // min
  }

  // Private Methods

  _description() {
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
    // `${this.type[0].toUpperCase()}${this.type.slice(1)}` -> Primeira letra maiuscula
    this.description = `${this.type[0].toUpperCase()}${this.type.slice(1)} on ${
      months[this.date.getMonth()]
    } ${this.date.getDate()}`;
  }

  // Instance Methods - Public Interface ** Erro
  click() {
    this.click++;
  }
}

class Running extends Workout {
  name = 'Running';
  type = 'running';
  constructor(coords, distance, duration, cadence) {
    super(coords, distance, duration);
    this.cadence = cadence;
    this.calcPace();
    this._description();
  }

  calcPace() {
    // min/km
    this.pace = this.duration / this.distance;
  }
}

class Cycling extends Workout {
  name = 'Cycling';
  type = 'cycling';
  constructor(coords, distance, duration, elevationGain) {
    super(coords, distance, duration);
    this.calcSpeed();
    this.elevationGain = elevationGain;
    this._description();
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
    this._getLocalStorage();

    // Events

    // Disparar evento de submit toda vez que o usuário apertar enter em algum campo do form
    form.addEventListener('submit', this._newWorkout.bind(this));

    // Evento mudança de tipo de exercício
    inputType.addEventListener('change', this._toggleElevationField);

    containerWorkouts.addEventListener('click', this._moveToMarker.bind(this));
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

    // Render Workouts saved at local storage 
    this.#workouts.forEach((workout) => this.renderWorkoutMarker(workout));
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
      const elevationGain = +inputElevation.value;
      console.log(type);

      if (
        !validInputs(distance, duration) ||
        !allPositive(distance, duration) // Elevation Gain can be negative
      )
        return alert('Inputs have to be positive numbers');

      // Create an object + push
      workout = new Cycling([lat, lng], distance, duration, elevationGain);
    }

    // Add new workout to workouts array
    this.#workouts.push(workout);

    // Add Workout to the local storage
    this._setLocalStorage();

    // Render Workout as a Marker
    this.renderWorkoutMarker(workout);

    // Render Workout list
    this._renderWorkout(workout);

    // Hide form
    form.style.display = 'none';
    form.classList.add('hidden');
    // Tirar animação de transição por 1 segundo
    setTimeout(() => (form.style.display = 'grid'), 1000);

    // Clean form
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
      .setPopupContent(
        `${workout.type === 'running' ? '🏃‍♂️' : '🚴‍♂️'} ${workout.description}`
      )
      .openPopup();
  }

  _renderWorkout(workout) {
    // html em comum
    let html = `
    <li class="workout workout--${workout.type}" data-id="${workout.id}">
      <h2 class="workout__title">${workout.description}</h2>
      <div class="workout__details">
        <span class="workout__icon">${workout.type === 'running' ? '🏃‍♂️' : '🚴‍♂️'}
        </span>
        <span class="workout__value">${workout.distance}</span>
        <span class="workout__unit">km</span>
      </div>
      <div class="workout__details">
        <span class="workout__icon">⏱</span>
        <span class="workout__value">${workout.duration}</span>
        <span class="workout__unit">min</span>
      </div>
    `;

    if (workout.type === 'running') {
      html += `
        <div class="workout__details">
          <span class="workout__icon">⚡️</span>
          <span class="workout__value">${workout.cadence}</span>
          <span class="workout__unit">min/km</span>
        </div>
        <div class="workout__details">
          <span class="workout__icon">🦶🏼</span>
          <span class="workout__value">${workout.pace}</span>
          <span class="workout__unit">spm</span>
        </div>
      </li>
      `;
    }

    if (workout.type === 'cycling') {
      html += `
        <div class="workout__details">
          <span class="workout__icon">⚡️</span>
          <span class="workout__value">16</span>
          <span class="workout__unit">km/h</span>
        </div>
        <div class="workout__details">
          <span class="workout__icon">⛰</span>
          <span class="workout__value">223</span>
          <span class="workout__unit">m</span>
        </div>
      </li>
      `;
    }

    // Insere elemento html após o form (afterend)
    form.insertAdjacentHTML('afterend', html);
  }

  _moveToMarker(e) {
    // Get clicked Element
    const workoutEl = e.target.closest('.workout');
    if (!workoutEl) return;

    // Getting clicked object
    const clickedWorkout = this.#workouts.find(
      workout => workout.id === workoutEl.dataset.id
    );

    // Move to marker
    this.#map.setView(clickedWorkout.coords, 16, {
      animate: true,
      pan: {
        duration: 1,
      },
    });

    // clickedWorkout.click();
  }

  _setLocalStorage() {
    // JSON.stringfy(OBJ) -> Converte o objeto em uma string (JSON)
    localStorage.setItem("workouts",JSON.stringify(this.#workouts));
  }

  _getLocalStorage() {
    // JSON.parse(JSON) -> Converte o JSON em Objeto, entretanto o mesmo se torna apenas um regular object, assim perde seu prototype chain 
    const data = JSON.parse(localStorage.getItem("workouts"));

    if (!data) return;
    this.#workouts = data; 

    this.#workouts.forEach((workout) =>{
      this._renderWorkout(workout);
     });

  }

  resetLocalStorage() {
    localStorage.removeItem("workouts");
    location.reload() // reload the page 
  }
}

// ========================================

// Running App

// Testando workout classes
// const run1 = new Running([15, 12], 2, 45, 55, 1000);
// const ciclista1 = new Cycling([15, 12], 2, 10, 2);
// console.log(run1);
// console.log(run1.date.toDateString());
// console.log(run1.constructor.name);
// console.log(ciclista1);

const app = new App();
