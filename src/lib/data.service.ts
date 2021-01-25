import { HttpClient } from './http.client';
import { User } from './user.model';
import { PlaceCoord, BeenPlace, Place } from './place.model';

export class DataService extends HttpClient {
    public constructor() {
        super('http://localhost:7080');
      }
    
    public getUsers = () => this.instance.get<User[]>('/users');
      
    public getBeenPlaces = (user_id: number) => this.instance.get<BeenPlace[]>(`/been/${user_id}`);

    public addToBeenPlaces = (user_id: number, place_id: number) => this.instance.post<any[]>(`/been`, { user_id, place_id});

    public getPlace = (place_id: number) => this.instance.get<any>(`/place/${place_id}`);

    public getPlaceCoord = (place_id: number) => this.instance.get<PlaceCoord>(`/coord/${place_id}`);

    public getPlaces = () => this.instance.get<any[]>(`/places`);

    public getCitiesOfCountry = (country: string) => this.instance.get<any[]>(`/cities/${country}`);
}