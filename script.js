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

// Variáveis Globais
let map, mapEvent;

// Leaflet - Map library:
const dspMap = function (latitude, longitude) {
  // Create a map in the 'map' div (l.map("div id"))
  map = L.map('map').setView([latitude, longitude], 15);

  // Layout do mapa
  L.tileLayer('http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
    maxZoom: 20,
    subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
  }).addTo(map);

  // Quando clicar no mapa exibir um marker na posição em que clicamos
  //  O metodo on da library funciona como o addEventListener
  map.on('click', function (mapE) {
    mapEvent = mapE; // Objeto que contém coordenas do click no map
    const { lat, lng } = mapE.latlng;

    // Display form
    form.classList.remove('hidden');
    inputDistance.focus();
  });
};

// Geolocation: É uma API que esta disponível nos Browsers:

// getCurrentPostion(sucess callback, error call back)

// Para evitar possíveis erros em Browsers antigos, só chamamos o metodo getCurrentPosition se a API estiver disponível
if (navigator.geolocation);
navigator.geolocation.getCurrentPosition(
  geoLocObj => {
    //   Destructuing Objects: Extrair dado de uma propriedade e armazenar em uma variável de mesmo nome
    const { latitude } = geoLocObj.coords;
    const { longitude } = geoLocObj.coords;
    dspMap(latitude, longitude);
  },
  () => alert('Não foi possível encontrar sua localização')
);

// Disparar evento de submit toda vez que o usuário apertar enter em algum campo do form
form.addEventListener('submit', function (e) {
  // Por padrão ao apertar enter em um form a página é recarregada
  e.preventDefault();

  // limpar form
  inputDistance.value = inputDuration.value = inputCadence.value = inputElevation.value =
    '';

  // Display Marker
  const { lat, lng } = mapEvent.latlng;
  L.marker([lat, lng])
    .addTo(map)
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
});

// Evento mudança de tipo de exercício
inputType.addEventListener('change', function () {
  inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
  inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
});

// Architecture: Where the data wil be store
