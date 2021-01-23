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

// Geolocation: É uma API que esta disponível nos Browsers:

// getCurrentPostion(sucess callback, error call back)

// Para evitar possíveis erros em Browsers antigos, só chamamos o metodo getCurrentPosition se a API estiver disponível
if (navigator.geolocation);
navigator.geolocation.getCurrentPosition(
  geoLocObj => {
    //   Destructuing Objects: Extrair dado de uma propriedade e armazenar em uma variável de mesmo nome
    const { latitude } = geoLocObj.coords;
    const { longitude } = geoLocObj.coords;
    console.log(`https://www.google.com/maps/@${latitude},${longitude}`);
  },
  () => alert('Não foi possível encontrar sua localização')
);
