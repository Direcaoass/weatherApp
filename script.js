
(function startApp() {

    const cardsContainer = document.querySelector('#cards-container')
    const cityTarget = document.querySelector('#city-target');

    showCards();
    loadTheme();
    domEvents();



    async function getWeatherData(city) {
        const apiKey = "ff5097e00b0a62bfa92e61f36e6d4d7c";

        const apiWeatherURL = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}&lang=pt_br`;

        const res = await fetch(apiWeatherURL);
        const data = await res.json();

        return data;
    };


    function generateId() {
        return Math.floor(Math.random() * 9000);
    }

    async function addCard() {

        const apiCountryURL = "https://countryflagsapi.com/png/";
        const data = await getWeatherData(cityTarget.value);
        if (data.cod === "404") {
            alert('Cidade não encontrada');
            return
        }

        const cardObject = {
            id: generateId(),
            city: data.name,
            temperature: parseInt(data.main.temp),
            description: data.weather[0].description,
            weatherIconSrc: `http://openweathermap.org/img/wn/${data.weather[0].icon}.png`,
            countryFlagSrc: apiCountryURL + data.sys.country,
            humidity: `${data.main.humidity}%`,
            wind: `${data.wind.speed}km/h`,
            pinned: false,
        };

        const cardElement = createHtmlCard(cardObject.id, cardObject.city, cardObject.temperature, cardObject.description, cardObject.weatherIconSrc, cardObject.countryFlagSrc, cardObject.humidity, cardObject.wind);

        cardsContainer.appendChild(cardElement);
        const cards = getCards();
        cards.push(cardObject);
        saveCards(cards);
        cityTarget.value = '';
    }


    function createHtmlCard(id, city, temperature, description, weatherIconSrc, countryFlagSrc, humidity, wind, pinned) {

        const card = document.createElement('div');
        card.classList.add('card');
        const weatherData = document.querySelector('.weather-data')
        const cloneWeatherData = weatherData.cloneNode(true);
        cloneWeatherData.classList.remove('hide');

        const cityHtml = cloneWeatherData.querySelector('#city');
        const countryFlagHtml = cloneWeatherData.querySelector('#country');
        const temperatureHtml = cloneWeatherData.querySelector('#temperature');
        const descriptionHtml = cloneWeatherData.querySelector('#description');
        const weatherIconHTML = cloneWeatherData.querySelector('#weather-icon');
        const humdityHtml = cloneWeatherData.querySelector('#humidity span');
        const windHtml = cloneWeatherData.querySelector('#wind span');

        cityHtml.innerText = city;
        countryFlagHtml.setAttribute('src', countryFlagSrc);
        temperatureHtml.innerHTML = (`${temperature}ºC`);
        descriptionHtml.innerHTML = description;
        weatherIconHTML.setAttribute('src', weatherIconSrc);
        humdityHtml.innerHTML = humidity;
        windHtml.innerHTML = wind;

        card.appendChild(cloneWeatherData);
        createPinIcon(card, pinned);
        createDeleteIcon(card);
        cardEvents(id, card);
        return card;
    }

    function createPinIcon(card, pinned) {
        const pinIcon = document.createElement('i');
        pinIcon.classList.add(...['bi', 'bi-pin'])
        card.appendChild(pinIcon);
        if (pinned) {
            card.classList.add('pinned');
        }
        const pinToolTip = document.createElement('span');
        pinToolTip.innerText = 'pin';
        pinToolTip.classList.add('tooltip');
        pinIcon.appendChild(pinToolTip);
    }

    function createDeleteIcon(card) {
        const deleteIcon = document.createElement('i');
        deleteIcon.classList.add(...['bi', 'bi-x-lg'])
        card.appendChild(deleteIcon);
        const deleteToolTip = document.createElement('span');
        deleteToolTip.innerText = 'delete';
        deleteToolTip.classList.add('tooltip');
        deleteIcon.appendChild(deleteToolTip);
    }


    function cardEvents(id, card) {

        card.querySelector('.bi-pin').addEventListener('click', () => {
            togglePinCard(id);
        });
        card.querySelector('.bi-x-lg').addEventListener('click', () => {
            deleteCards(id, card);
        });

    }

    function showCards() {
        clearCards();
        updateCards();

        getCards().forEach((card) => {

            const cardElement = createHtmlCard(card.id, card.city, card.temperature, card.description, card.weatherIconSrc, card.countryFlagSrc, card.humidity, card.wind, card.pinned);

            cardsContainer.appendChild(cardElement);

        });
    }

    async function updateCards() {
        const cardsUpdated = getCards();
        for (let card of cardsUpdated) {
            const data = await getWeatherData(card.city);
            card.temperature = parseInt(data.main.temp);
            card.description = data.weather[0].description;
            card.weatherIconSrc = `http://openweathermap.org/img/wn/${data.weather[0].icon}.png`;
            card.humidity = `${data.main.humidity}%`;
            card.wind = `${data.wind.speed}km/h`;
        }
        saveCards(cardsUpdated);
    }

    function clearCards() {
        cardsContainer.replaceChildren([]);

    }

    function togglePinCard(id) {
        const cards = getCards()
        const targetCard = cards.filter((card) => card.id === id)[0];
        targetCard.pinned = !targetCard.pinned;
        saveCards(cards);
        showCards();

    }

    function deleteCards(id, card) {
        const cards = getCards().filter((card) => card.id !== id);
        saveCards(cards);

        cardsContainer.removeChild(card);
    }


    function toggleDarkMode() {
        document.body.classList.toggle("dark");
    }

    function loadTheme() {
        const darkMode = localStorage.getItem("dark");
        if (darkMode) {
            toggleDarkMode();
        }
    }


    //Local Storage

    function saveCards(cards) {
        localStorage.setItem('cards', JSON.stringify(cards));

    }

    function getCards() {
        const cards = JSON.parse(localStorage.getItem('cards') || '[]')
        const orderedCards = cards.sort((a, b) => (a.pinned > b.pinned ? -1 : 1));

        return orderedCards;
    }


    //Events


    function domEvents() {

        const addCardBtn = document.querySelector('.add-card');
        addCardBtn.addEventListener('click', () => {
            if (!cityTarget.value)
                alert('Digite o nome de uma cidade')
            else addCard();
        })


        cityTarget.addEventListener('keyup', (e) => {

            if (e.key === 'Enter' && cityTarget.value)
                addCard();
            else if ((e.key === 'Enter' && !cityTarget.value))
                alert('Digite o nome de uma cidade')
        });


        const changeThemeBtn = document.querySelector("#change-theme");
        changeThemeBtn.addEventListener("click", () => {
            toggleDarkMode();
            if (document.body.classList.contains("dark")) {
                localStorage.setItem("dark");
            }
            else localStorage.removeItem("dark");
        });

    }
})()