import mapboxgl from 'mapbox-gl';
import { MDCSelect } from '@material/select';
import { MDCTextField } from '@material/textfield';
import { MDCRipple } from '@material/ripple';
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

export class App {
    public markers: any[] = [];
    public beenPlacesLocalData: Place[] = [];
    public totalTravelDistance: number[] = [];
    public selectedPlaceId: any = 1;
    public USER_ID = 7;
    public USER_HOME_CITY_ID: number = 0;
    public userHomeCityPlaceCoord: PlaceCoord = {} as PlaceCoord;

    constructor(public dataService: DataService) {
        const buttonRipple = new MDCRipple(document.querySelector('.mdc-button')!);
        buttonRipple.listen('click', () => this.getCitiesOptions());

        const addToVisitedPlacesButton = new MDCRipple(document.getElementById('add-to-visited-places')!);
        addToVisitedPlacesButton.listen('click', () => this.addToVisitedPlaces());

        this.renderData();
    }

    async showBeenPlacesOnMap(user_id: number) {
        this.beenPlacesLocalData = [];
        this.totalTravelDistance = [];
        if (this.markers.length !== 0) { this.markers.forEach((marker) => { marker.remove(); }); }

        // Set user marker to map
        this.setHomeCity()

        this.dataService.getBeenPlaces(user_id).then(async (res) => {
            const beenPlaces: BeenPlace[] = await res;
            beenPlaces.forEach(place => {
                this.dataService.getPlace(place.place_id).then(async (result) => {
                    const placeData: Place = await result;
                    this.beenPlacesLocalData.push(placeData);

                    this.dataService.getPlaceCoord(placeData.gid).then(async (coordRes) => {
                        const coordiantes: PlaceCoord = await coordRes;
                        this.dataService.getDistance(this.userHomeCityPlaceCoord, coordiantes).then(async (d) => {
                            const distance = await d;
                            this.totalTravelDistance.push(Math.round(distance.st_distancesphere / 1000));
                            const popup = new mapboxgl.Popup({ offset: 25 })
                                .setText(`${placeData.name}, ${placeData.country},
                            Distance from home city: ${Math.round(distance.st_distancesphere / 1000)} km`);
                            const placeMarker = new mapboxgl.Marker({color: '#a1cacd'})
                                .setLngLat([coordiantes.st_x, coordiantes.st_y])
                                .setPopup(popup)
                                .addTo(map);
                            this.markers.push(placeMarker);
                        });
                    });
                });
            });
        });
    }

    setHomeCity() {
        this.dataService.getUser(this.USER_ID).then(async (result) => {
            const user = await result;
            this.writeGreeting(user);
            this.USER_HOME_CITY_ID = user.homecityid;
            this.dataService.getPlaceCoord(this.USER_HOME_CITY_ID).then(async (res) => {
                this.userHomeCityPlaceCoord = await res;
                this.dataService.getPlace(this.USER_HOME_CITY_ID).then(async (place) => {
                    const placeData: Place = await place;
                    const homeCityPopup = new mapboxgl.Popup({ offset: 25 })
                        .setText(`Home city: ${placeData.name}, ${placeData.country}`);
                    const homeCityMarker = new mapboxgl.Marker({color: '#c24f4a'})
                        .setLngLat([this.userHomeCityPlaceCoord.st_x, this.userHomeCityPlaceCoord.st_y])
                        .setPopup(homeCityPopup)
                        .addTo(map);
                    this.markers.push(homeCityMarker);
                });
            });
        });
    }

    // Get been places for passed user_id and show them on the map
    renderData() {
        this.showBeenPlacesOnMap(this.USER_ID).then(() => {
            setTimeout(() => {
                this.writeMostVisitedCountry(this.getMostVisitedCountry());
                this.writeTotalTravelDistance(this.getTotalTravelDistance());
            }, 1000);
        });
    }

    getCitiesOptions() {
        const ul = document.getElementById('city-select-ul')!;
        ul.innerHTML = `<li class="mdc-list-item mdc-list-item--selected" aria-selected="true" data-value="" role="option">
    <span class="mdc-list-item__ripple"></span></li>`;
        const textField = new MDCTextField(document.querySelector('.mdc-text-field')!);
        this.dataService.getCitiesOfCountry(textField.value).then(async (lc) => {
            const listOfCities =  await lc;
            listOfCities.forEach((city) => { ul.insertAdjacentHTML('beforeend', this.addOption(city.name, city.gid)); });
            const select = new MDCSelect(document.querySelector('.mdc-select')!);

            select.listen('MDCSelect:change', () => {
                this.selectedPlaceId = select.value;
            });
        });
    }

    addToVisitedPlaces() {
        if (this.selectedPlaceId !== undefined) {
            this.dataService.addToBeenPlaces(this.USER_ID, this.selectedPlaceId)
                .then(() => setTimeout(() => this.renderData(), 500));
        }
    }

    getMostVisitedCountry() {
        let visitedCountries: CountryCount[] = [];

        this.beenPlacesLocalData.forEach((beenPlace: Place) => {
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

    writeMostVisitedCountry(data: Country) {
        const el = document.getElementById('mostVisitedCountry');
        if (!!el) { el.innerHTML = `Most visited country: ${data.country}`; }
    }

    getTotalTravelDistance() {
        let totalDistance = 0;
        this.totalTravelDistance.forEach(distance => { totalDistance += distance; });
        return totalDistance;
    }

    writeTotalTravelDistance(totalDistance: number) {
        const el = document.getElementById('totalDistanceTraveled');
        if (!!el) { el.innerHTML = `Total distance traveled: ${totalDistance}km`; }
    }

    writeGreeting(user: User) {
        const el = document.getElementById('greeting');
        if (!!el) { el.innerHTML = `Hello ${user.name}, welcome to Traveler's Journal`; }
    }

    addOption = (optionName: string, optionValue: number) =>
        `<li class="mdc-list-item" aria-selected="false" data-value="${optionValue}" role="option">
        <span class="mdc-list-item__ripple"></span>
        <span class="mdc-list-item__text">${optionName}</span>
        </li>`
}

// Fire up the app
new App(new DataService());
