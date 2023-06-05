const playBtn = document.querySelector('.play-btn')
const gameDescription = document.querySelector('.game-description-box')
const gameActive = document.querySelector('.game-active')
const countryEle = document.querySelector('.country')
const scoreEle = document.querySelector('.score')
const ScorePopupEle = document.querySelector('.score-popup')
const currScoreEle = document.querySelector('.curr-score')
const popupMessageEle = document.querySelector('.message')
const timerEle = document.querySelector('.timer')
const levelNickEle = document.querySelector('.level-nick')
const currLevelEle = document.querySelector('.curr-level')
import { countriesL1, countriesL2, countriesL3, countriesL4 } from './countries.js';


//create levels
class Level {

    constructor(name) {
        this.name = name
        const levelData = {
            1: { point: 10, time: 25, countries: countriesL1, nick: 'Level One' },
            2: { point: 15, time: 20, countries: countriesL2, nick: 'Level Two' },
            3: { point: 25, time: 15, countries: countriesL3, nick: 'Level Three' },
            4: { point: 30, time: 10, countries: countriesL4, nick: 'Level Four' }
        }
        const { point, time, countries, nick } = levelData[this.name]
        this.point = point
        this.time = time
        this.countries = countries
        this.nick = nick
    }
    getRandomCountry() {
        const randomIndex = Math.trunc(Math.random() * this.countries.length)
        const randomCountry = this.countries[randomIndex]
        this.countries.splice(randomIndex, 1)
        return randomCountry
    }
}


class App {
    #map
    #mapEvent
    #currentCountry
    #score = 0
    #mapZoom = 3
    #time = 100
    #timer
    #level = 1
    #points
    #levelNick
    #hits = 0

    constructor() {
        //Own methods
        this.#getCurrentLocation()
        this.#createLevel()
        //Listeners events
        playBtn.addEventListener('click', this.#initScreen.bind(this))
    }
    #getCurrentLocation() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                this.#loadMap.bind(this),
                function () {
                    alert('turn on your geolocation')
                })
        }
    }
    #loadMap(position) {
        const { longitude } = position.coords
        const { latitude } = position.coords
        const coords = [latitude, longitude]

        this.#map = L.map('map').setView(coords, this.#mapZoom)
        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        }).addTo(this.#map)

    }
    #createLevel(){
        this.#level = new Level(this.#level)
        this.#time = this.#level.time
        this.#points = this.#level.point
        this.#levelNick = this.#level.nick
        levelNickEle.textContent = this.#level.nick
        currLevelEle.textContent = this.#level.nick
    }
    #initScreen() {
        gameDescription.classList.add('hidden')
        gameActive.classList.remove('hidden')
        //start game
        this.#startGame()
    }
    #startGame() {
        //show a country
        this.#showCountry()

        // Enable click on map event and create marker
        this.#map.on('click', this.#getUserResponse.bind(this))

        //start timer
        this.#startTimer()

    }

    async #getUserResponse(mapEvent) {
        //Get user click coords
        this.#mapEvent = mapEvent
        const { lat } = this.#mapEvent.latlng
        const { lng } = this.#mapEvent.latlng

        //convert the user coords to a country
        async function getCountry() {
            try {
                const response = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`)
                const data = response.json()
                return data

            } catch (error) {
                console.log(error, 'Unable to fetch data from https://nominatim.openstreetmap.org')
            }
        }
        const data = await getCountry()
        if (data.error === 'Unable to geocode') return alert('Click on the right place')
        const country = data.address.country

        //Create Marker if the place exists and time is grater than 0
        if (this.#time >= 0) {
            this.#createMarker(this.#mapEvent.latlng.lat, this.#mapEvent.latlng.lng, country)
        }
        
        //check if the country is correct
        this.#checkUserResponse(country)

    }
    #createMarker(lat, lng, countryName, className) {
        L.marker([lat, lng])
            .addTo(this.#map)
            .bindPopup(
                L.popup({
                    maxWidth: 250,
                    minWidth: 100,
                    closeButton: false,
                    autoClose: false,
                    closeOnClick: false,
                    className: className
                })
            )
            .setPopupContent(countryName)
            .openPopup()
    }
    #checkUserResponse(country) {
        if (this.#removeAccent(this.#currentCountry.name) === this.#removeAccent(country) && this.#time >= 0) {
            clearInterval(this.#timer)
            this.#hits ++
            this.#addPoints()
            this.#showSuccessPopup()
            this.#showCountry()
            timerEle.classList.remove('timer-gone')
            this.#time = this.#level.time + 2
            this.#startTimer()
            //check for a new level
            this.#checkLevel()
        } else {
            this.#map.off('click')
            this.#showFailPopup('Good Attempt')
            clearInterval(this.#timer)
        }
    }
    #checkLevel(){
        if (this.#hits >= 4 && this.#hits < 8){
            this.#level = 2
            this.#createLevel()
        }
        if (this.#hits >= 8 && this.#hits < 12){
            this.#level = 3
        this.#createLevel()
        }
        if (this.#hits >= 12){
            this.#level = 4
            this.#createLevel()
        }
    }
    #showCountry() {
        const randomCountry = this.#level.getRandomCountry()
        this.#currentCountry = randomCountry
        countryEle.textContent = randomCountry.name
    }
    #addPoints() {
        this.#score += this.#points
        scoreEle.textContent = this.#score
        currScoreEle.textContent = this.#score
    }
    #showSuccessPopup() {
        ScorePopupEle.classList.remove('hidden')
        setTimeout(function () {
            ScorePopupEle.classList.add('hidden')
        }, 2000)
    }
    #showFailPopup(message) {
        const [lat, lng] = [...this.#currentCountry.lanlng]
        popupMessageEle.textContent = message
        ScorePopupEle.classList.remove('hidden')
        this.#map.setZoom(this.#mapZoom);
        const self = this
        setTimeout(function () {
            ScorePopupEle.classList.add('hidden')
            self.#moveMapTo(lat, lng)
        }, 4000)
        this.#restartGame()
    }

    #removeAccent(string) {
        const normalizedString = string.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        return normalizedString
    }
    #moveMapTo(lat, lng) {
        this.#createMarker(lat, lng, this.#currentCountry.name, 'right-place')
    }
    #restartGame() {
        setTimeout(function () {
            location.reload();
        }, 10000);
    }
    #startTimer() {
        const self = this
        const tick = function () {
            const min = String(Math.trunc(self.#time / 60)).padStart(2, '0')
            const sec = String(self.#time % 60).padStart(2, '0')
            timerEle.textContent = `${min}:${sec}`
            self.#time --
            if (self.#time <= 5) timerEle.classList.add('timer-gone')

            if (self.#time < 0) {
                self.#map.off('click')
                clearInterval(self.#timer)
                self.#showFailPopup('Time Over!')
            }

            
        }
        tick()
        this.#timer = setInterval(tick, 1000)
        return this.#timer
    }
}

const app = new App()


