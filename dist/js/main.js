import { 
	getCoordsFromApi,
	setLocationObject, 
	getWeatherFromCoords,
	getHomeLocation, 
	cleanText 
} from "./dataFunctions.js";
import { 
	setPlaceholderText,
	addSpinner, 
	displayError, 
	displayApiError,
	updateScreenReaderConfirmation,
	updateDisplay
} from "./domFunctions.js";
import CurrentLocation from './CurrentLocation.js';
const currentLoc = new CurrentLocation;

const initApp = () => {
	// add listeners
	const geoButton = document.querySelector('#getLocation');
	geoButton.addEventListener('click', getGeoLocation);
	const homeButton = document.querySelector('#home');
	homeButton.addEventListener('click', loadWeather);
	const saveButton = document.querySelector('#saveLocation');
	saveButton.addEventListener('click', saveLocation);
	const unitButton = document.querySelector('#unit');
	unitButton.addEventListener('click', setUnitPref);
	const refreshButton = document.querySelector('#refresh');
	refreshButton.addEventListener('click', refreshWeather);
	const locationEntry = document.querySelector('#searchBar__form');
	locationEntry.addEventListener('submit', submitNewLocation);
	// set up
	setPlaceholderText();
	// load weathe
	loadWeather();
}

document.addEventListener("DOMContentLoaded", initApp);

const getGeoLocation = (event) => {
	if (event) {
		if (event.type === 'click') {
			const mapIcon = document.querySelector('.fa-map-marker-alt');
			addSpinner(mapIcon);
		}
	}
	if (!navigator.geolocation) return geoError();
	navigator.geolocation.getCurrentPosition(geoSuccess, geoError);
}

const geoError = (errObj) => {
	error.errMsg = errObj ? errObj.message : 'Geolocation not supported';
	displayErroe(errMsg, errMsg);
};

const geoSuccess = (position) => {
	const myCoordsObj = {
		lat: position.coords.latitude,
		lon: position.coords.longitude,
		name: `Lat:${position.coords.latitude} Long:${position.coords.longitude}`
	};
	
	setLocationObject(currentLoc, myCoordsObj);
	updateDataAndDisplay(currentLoc);
};

const loadWeather = (event) => {
	const savedLocation = getHomeLocation();
	if (!savedLocation && !event) return getGeoLocation();
	if (!savedLocation && event.type == 'click') {
		displayError(
			'No Home Location Saved.',
			'Sorry. Please save your home location first.'
		);
	} else if (savedLocation && !event) {
		displayHomeLocationWeather(savedLocation);
	} else {
		const homeIcon = document.querySelector('.fa-home');
		addSpinner(homeIcon);
		displayHomeLocationWeather(savedLocation);
	}
};

const displayHomeLocationWeather = (home) => {
	if (typeof home === 'string') {
		const locationJson = JSON.parse(home);
		const myCoordsObj = {
			lat: locationJson.lat,
			lon: locationJson.lon,
			name: locationJson.name,
			unit: locationJson.unit,
		};
		setLocationObject(currentLoc, myCoordsObj);
		updateDataAndDisplay(currentLoc);
	}
};

const saveLocation = () => {
	if (currentLoc.getLat() && currentLoc.getLon()) {
		const saveIcon = document.querySelector('.fa-save');
		addSpinner(saveIcon);
		const location = {
			name: currentLoc.getName(),
			lat: currentLoc.getLat(),
			lon: currentLoc.getLon(),
			unit: currentLoc.getUnit()
		};
		localStorage.setItem("defaultWeatherLocation", JSON.stringify(location));
		updateScreenReaderConfirmation(
			`Saved ${currentLoc.getName()} as home location.`
		)
	}
};

const setUnitPref = () => {
	const unitIcon = document.querySelector('.fa-char-bar');
	addSpinner(unitIcon);
	currentLoc.toggleUnit();
	updateDataAndDisplay(currentLoc);
};

const refreshWeather = () => {
	const refreshIcon = document.querySelector('.fa-sync-alt');
	addSpinner(refreshIcon);
	updateDataAndDisplay(currentLoc)
};

const submitNewLocation = async (event) => {
	event.preventDefault();
	const text = document.querySelector('#searchBar__text').value;
	const entryText = cleanText(text);
	if(!entryText.length) return;
	const locationIcon = document.querySelector('.fa-search');
	addSpinner(locationIcon);
	const coordsData = await getCoordsFromApi(entryText, currentLoc.getUnit());
	if(coordsData){
		if(coordsData.cod === 200){
			const myCoordsObj = {
				lat: coordsData.coord.lat,
				lon: coordsData.coord.lon,
				name: coordsData.sys.country
					? `${coordsData.name}, ${coordsData.sys.country}`
					: coordsData.name,
			};
			setLocationObject(currentLoc, myCoordsObj);
			updateDataAndDisplay(currentLoc);
		} else {
			displayApiError(coordsData);
		}
	}else {
		displayError("Connection Error", "Connection Error")
	}
};

const updateDataAndDisplay = async (locationObj) => {
	const weatherJson = await getWeatherFromCoords(locationObj);
	if(weatherJson) updateDisplay(weatherJson,locationObj);
};
