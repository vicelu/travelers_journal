import mapboxgl from 'mapbox-gl';
import { BeenPlace } from './lib/been-place.model';
import { DataService } from './lib/data.service';
import { Place } from './lib/place.model';

mapboxgl.accessToken = 'pk.eyJ1IjoicGVyaWNha2Vrc2ljIiwiYSI6ImNqdzF1OW1jZjA2M3o0NW9oc2M3ZjlnemcifQ.1ne59J5h9DSP1COwAJnQ_A';
const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/pericakeksic/ckkabs8180nwt18rwpfnd2gh8',
    center: [25, 25],
    zoom: 2
});

const dataService = new DataService();

dataService.getUsers().then((res) => console.log(res));
// dataService.getPlaces().then(async (res) => {
//     const places = await res;
//     console.log(places.length);
// });
dataService.getBeenPlaces(1).then(async (res) => {
    const beenPlaces = await res;
    beenPlaces.forEach(place => {
        dataService.getPlace(place.place_id).then(async (result) => {
            const placeData: Place[] = await result;
            const placeMarker = new mapboxgl.Marker().setLngLat([placeData[0].st_x, placeData[0].st_y]).addTo(map);
        });
    });
});

