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

// Classes: App, Workout -> Running, Cycling

class App {
  // Private Var
  #map;
  #mapEvent;

  constructor() {
    // Display Map, assim que criarmos uma instância.
    this._getPosition();

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
    // Por padrão ao apertar enter em um form a página é recarregada
    e.preventDefault();

    // limpar form
    inputDistance.value = inputDuration.value = inputCadence.value = inputElevation.value =
      '';

    // Display Marker
    const { lat, lng } = this.#mapEvent.latlng;
    L.marker([lat, lng])
      .addTo(this.#map)
      .bindPopup(
        L.popup({
          // Personalizar Popup
          maxWidth: 250,
          minWidth: 100,
          autoClose: false, // autoClose: fecha o popup toda vez que algum outro estiver aberto
          closeOnClick: false,
          className: 'running-popup', // CSS class
        })
      )
      .setPopupContent('Workout')
      .openPopup();
  }
}

// Precisa ser criado após o mapa ser carregado

const app = new App();
console.log(app);

// OBS: Chamando a successful callback no metodo getCurrentPosition() -> Como o this da callback não esta apontando para o objeto foi necessário usar o metodo bind (retorna uma nova função) para setarmos o this manualmente
