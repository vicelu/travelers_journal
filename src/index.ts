import mapboxgl from 'mapbox-gl';
import {MDCSelect} from '@material/select';
import {MDCMenu} from '@material/menu';
import {MDCTextField} from '@material/textfield';
import {MDCRipple} from '@material/ripple';
import { DataService } from './lib/data.service';
import { PlaceCoord, Place, BeenPlace, Country, CountryCount } from './lib/place.model';

mapboxgl.accessToken = 'pk.eyJ1IjoicGVyaWNha2Vrc2ljIiwiYSI6ImNqdzF1OW1jZjA2M3o0NW9oc2M3ZjlnemcifQ.1ne59J5h9DSP1COwAJnQ_A';
const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/pericakeksic/ckkabs8180nwt18rwpfnd2gh8',
    center: [55, 25],
    zoom: 1.2
});

let markers: any[] = [];
let beenPlacesLocalData: Place[] = [];
let selectedPlaceId: any = 1;
const USER_ID = 1;

const dataService = new DataService();

const getUsers = () => dataService.getUsers();

const getPlaces = () => dataService.getPlaces();

const getPlace = (place_id: number) => dataService.getPlace(place_id);

const getPlaceCoord = (place_id: number) => dataService.getPlaceCoord(place_id);

const getBeenPlaces = (user_id: number) => dataService.getBeenPlaces(user_id);

const showBeenPlacesOnMap = async (user_id: number) => {
    beenPlacesLocalData = [];
    if (markers.length !== 0) { markers.forEach((marker) => { marker.remove(); }); }
    
    getBeenPlaces(user_id).then(async (res) => {
        const beenPlaces: BeenPlace[] = await res;
        beenPlaces.forEach(place => {
            getPlace(place.place_id).then(async (result) => {
                const placeData: Place = await result;
                beenPlacesLocalData.push(placeData);

                const popup = new mapboxgl.Popup({ offset: 25 }).setText(`${placeData.name}, ${placeData.country}`);
                getPlaceCoord(placeData.gid).then(async (coordRes) => {
                    const coordiantes: PlaceCoord = await coordRes;
                    const placeMarker = new mapboxgl.Marker()
                    .setLngLat([coordiantes.st_x, coordiantes.st_y])
                    .setPopup(popup)
                    .addTo(map);
                    markers.push(placeMarker);
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
        el.innerHTML = `${data.country}`;
    }
}

// Get been places for passed user_id and show them on the map
const updateBeenPlaces = () => {
        showBeenPlacesOnMap(USER_ID);
        setTimeout(() => {
            writeMostVisitedCountry(getMostVisitedCountry());
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
        updateBeenPlaces();
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