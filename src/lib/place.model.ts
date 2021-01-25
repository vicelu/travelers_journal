export interface PlaceCoord {
    st_x: number;
    st_y: number;
}

export interface Place {
    gid: number;
    name: string;
    country: string;
    capital: string;
    geom: any;
}

export interface BeenPlace {
    place_id: number;
}

export interface Country {
    country: string;
}

export interface CountryCount extends Country {
    count: number;
}