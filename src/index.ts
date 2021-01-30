import mapboxgl from 'mapbox-gl';
import {MDCSelect} from '@material/select';
import {MDCTextField} from '@material/textfield';
import {MDCRipple} from '@material/ripple';
import { DataService } from './lib/data.service';
import { PlaceCoord, Place, BeenPlace, Country, CountryCount } from './lib/place.model';
import { User } from './lib/user.model';

mapboxgl.accessToken = 'pk.eyJ1IjoicGVyaWNha2Vrc2ljIiwiYSI6ImNqdzF1OW1jZjA2M3o0NW9oc2M3ZjlnemcifQ.1ne59J5h9DSP1COwAJnQ_A';
const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/pericakeksic/ckkabs8180nwt18rwpfnd2gh8',
    center: [55, 25],
    zoom: 1.2
});

let markers: any[] = [];
let beenPlacesLocalData: Place[] = [];
let totalTravelDistance: number[] = [];
let selectedPlaceId: any = 1;
const USER_ID = 7;
let USER_HOME_CITY_ID: number;

const dataService = new DataService();

const getUsers = () => dataService.getUsers();

const getPlaces = () => dataService.getPlaces();

const getPlace = (place_id: number) => dataService.getPlace(place_id);

const getPlaceCoord = (place_id: number) => dataService.getPlaceCoord(place_id);

const getDistance = (origin_place_point: PlaceCoord, destination_place_point: PlaceCoord) =>
    dataService.getDistance(origin_place_point, destination_place_point);

const getBeenPlaces = (user_id: number) => dataService.getBeenPlaces(user_id);

const showBeenPlacesOnMap = async (user_id: number) => {
    beenPlacesLocalData = [];
    totalTravelDistance = [];
    let userHomeCityPlaceCoord: PlaceCoord;
    if (markers.length !== 0) { markers.forEach((marker) => { marker.remove(); }); }
    dataService.getUser(USER_ID).then(async (result) => {
        const user = await result;
        writeGreeting(user);
        USER_HOME_CITY_ID = user.homecityid;
        getPlaceCoord(USER_HOME_CITY_ID).then(async (res) => {
            userHomeCityPlaceCoord = await res;
            getPlace(USER_HOME_CITY_ID).then(async (place) => {
                const placeData: Place = await place;
                const homeCityPopup = new mapboxgl.Popup({ offset: 25 }).setText(`Home city: ${placeData.name}, ${placeData.country}`);
                const homeCityMarker = new mapboxgl.Marker({color: '#c24f4a'})
                    .setLngLat([userHomeCityPlaceCoord.st_x, userHomeCityPlaceCoord.st_y])
                    .setPopup(homeCityPopup)
                    .addTo(map);
                markers.push(homeCityMarker);
            });
        });
    });
    
    getBeenPlaces(user_id).then(async (res) => {
        const beenPlaces: BeenPlace[] = await res;
        beenPlaces.forEach(place => {
            getPlace(place.place_id).then(async (result) => {
                const placeData: Place = await result;
                beenPlacesLocalData.push(placeData);

                getPlaceCoord(placeData.gid).then(async (coordRes) => {
                    const coordiantes: PlaceCoord = await coordRes;
                    getDistance(userHomeCityPlaceCoord, coordiantes).then(async (d) => {
                        const distance = await d;
                        totalTravelDistance.push(Math.round(distance.st_distancesphere / 1000));
                        const popup = new mapboxgl.Popup({ offset: 25 })
                            .setText(`${placeData.name}, ${placeData.country},
                            Distance from home city: ${Math.round(distance.st_distancesphere / 1000)} km`);
                        const placeMarker = new mapboxgl.Marker({color: '#a1cacd'})
                            .setLngLat([coordiantes.st_x, coordiantes.st_y])
                            .setPopup(popup)
                            .addTo(map);
                        markers.push(placeMarker);
                    });
                });
            });
        });
    });
}

const getMostVisitedCountry = () => {
    let visitedCountries: CountryCount[] = [];

    beenPlacesLocalData.forEach((beenPlace: Place) => {
        const visitedCountryIndex = visitedCountries.findIndex((country) => country.country === beenPlace.country);
        if (visitedCountryIndex < 0) {
            const newVisitedCountry: CountryCount = {country: beenPlace.country, count: 1};
            visitedCountries.push(newVisitedCountry);
        } else {
            visitedCountries[visitedCountryIndex].count++;
        }
    });

    let mostVisitedCountry: CountryCount = {} as CountryCount;
    visitedCountries.forEach((visitedCountry) => {
        if (!mostVisitedCountry?.count || mostVisitedCountry.count < visitedCountry.count) {
            mostVisitedCountry = visitedCountry;
        }
    });
    return {country: mostVisitedCountry.country} as Country;
}

const writeMostVisitedCountry = (data: Country) => {
    const el = document.getElementById('mostVisitedCountry');
    if (!!el) {
        el.innerHTML = `Most visited country: ${data.country}`;
    }
}

const getTotalTravelDistance = () => {
    let totalDistance = 0;
    totalTravelDistance.forEach(distance => {
        totalDistance += distance;
    });
    return totalDistance;
}

const writeTotalTravelDistance = (totalDistance: number) => {
    const el = document.getElementById('totalDistanceTraveled');
    if (!!el) {
        el.innerHTML = `Total distance traveled: ${totalDistance}km`;
    }
}

const writeGreeting = (user: User) => {
    const el = document.getElementById('greeting');
    if (!!el) {
        el.innerHTML = `Hello ${user.name}, welcome to Traveler's Journal`;
    }
}

// Get been places for passed user_id and show them on the map
const updateBeenPlaces = () => {
        showBeenPlacesOnMap(USER_ID);
        setTimeout(() => {
            writeMostVisitedCountry(getMostVisitedCountry());
            writeTotalTravelDistance(getTotalTravelDistance());
        }, 1000);
}

getUsers().then(console.log); // TODO At a later point if you have time, add sers dropdown, to switch between them

updateBeenPlaces();


const getCitiesOptions = () => {
    const ul = document.getElementById('city-select-ul')!;
    ul.innerHTML = `<li class="mdc-list-item mdc-list-item--selected" aria-selected="true" data-value="" role="option">
    <span class="mdc-list-item__ripple"></span>
    </li>`;
    const textField = new MDCTextField(document.querySelector('.mdc-text-field')!);
    dataService.getCitiesOfCountry(textField.value).then(async (lc) => {
        const listOfCities =  await lc;
        listOfCities.forEach((city) => {
            ul.insertAdjacentHTML('beforeend', addOption(city.name, city.gid));
        });
        const select = new MDCSelect(document.querySelector('.mdc-select')!);

        select.listen('MDCSelect:change', () => {
            selectedPlaceId = select.value;
        });
    });
}

const addToVisitedPlaces = () => {
    if (selectedPlaceId !== undefined) {
        dataService.addToBeenPlaces(USER_ID, selectedPlaceId).then(console.log);
        setTimeout(() => updateBeenPlaces(), 500);
    }
}

const buttonRipple = new MDCRipple(document.querySelector('.mdc-button')!);
buttonRipple.listen('click', () => getCitiesOptions());

const addToVisitedPlacesButton = new MDCRipple(document.getElementById('add-to-visited-places')!);
addToVisitedPlacesButton.listen('click', () => addToVisitedPlaces());

const addOption = (optionName: string, optionValue: number) => 
`<li class="mdc-list-item" aria-selected="false" data-value="${optionValue}" role="option">
<span class="mdc-list-item__ripple"></span>
<span class="mdc-list-item__text">${optionName}</span>
</li>`

const getUserHomeCityCoord = () => {
    // let userHomeCityPlaceCoord: PlaceCoord;
    dataService.getUser(USER_ID).then(async (result) => {
        const user = await result;
        USER_HOME_CITY_ID = user.homecityid;
        getPlaceCoord(USER_HOME_CITY_ID).then(async (res) => {
            return res;
        });
    });
}
console.log(getUserHomeCityCoord());

const getDistanceToBeenCities = (userHomeCityPlaceCoord: PlaceCoord) => {
    beenPlacesLocalData.forEach((place: Place) => {
        getPlaceCoord(place.gid).then(async (result) => {
            const beenPlaceCoord: PlaceCoord = await result;
            getDistance(userHomeCityPlaceCoord, beenPlaceCoord).then(async (d) => {
                const distance = await d;
                console.log(distance);
            });
        });
    });
}

