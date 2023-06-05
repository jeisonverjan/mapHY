const countriesL1 = ['Colombia', 'Costa Rica', 'China', 'Brasil']
const countriesL2 = ['Hungria', 'Madagascar', 'Alemania', 'Japon']
const countriesL3 = ['Lesoto', 'Ghana', 'Corea del Norte', 'Vietnam']
const countriesL4 = ['Catar', 'Chipre', 'Mali', 'Kwait']

class Level {
    
    constructor(name){
        this.name = name
        const levelData = {
            1:{point: 10, time: 25, countries: countriesL1, nick: 'Level One'},
            2:{point: 15, time: 20, countries: countriesL2, nick: 'Level Two'},
            3:{point: 25, time: 15, countries: countriesL3, nick: 'Level Three'},
            4:{point: 30, time: 10, countries: countriesL4, nick: 'Level Four'}
        }
        const {point, time, countries, nick} = levelData[this.name]
        this.point = point
        this.time = time
        this.countries = countries
        this.nick = nick
    }
    getRandomCountry(){
        const randomIndex = Math.trunc(Math.random()*this.countries.length)
        const randomCountry = this.countries[randomIndex]
        this.countries.splice(randomIndex, 1)
        return randomCountry
    }
}

const levelOne = new Level(4)

//console.log(levelOne.getRandomCountry())