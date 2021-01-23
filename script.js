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

// Leaflet - Map library:
const dspMap = function (latitude, longitude) {
  // Create a map in the 'map' div (l.map("div id"))
  const map = L.map('map').setView([latitude, longitude], 15);

  // Layout do mapa
  L.tileLayer('http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
    maxZoom: 20,
    subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
  }).addTo(map);

  //   Marker
  L.marker([latitude, longitude]).addTo(map).bindPopup('User Location');
  // .openPopup();
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
