import { HttpClient } from './http.client';
import { User } from './user.model';
import { BeenPlace } from './been-place.model';
import { Place } from './place.model';

export class DataService extends HttpClient {
    public constructor() {
        super('http://localhost:7080');
      }
    
    public getUsers = () => this.instance.get<User[]>('/users');
      
    public getBeenPlaces = (user_id: number) => this.instance.get<BeenPlace[]>(`/been/${user_id}`);

    public getPlace = (place_id: number) => this.instance.get<Place[]>(`/place/${place_id}`);

    public getPlaces = () => this.instance.get<any[]>(`/places`);
}