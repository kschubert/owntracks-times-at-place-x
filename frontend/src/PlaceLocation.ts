export type PlaceLocation = {
    latitude: number;
    longitude: number;
    time: number;
}

type Locations = {
    epoch: number;
    fetching: boolean;
    errMsg?: string;
    locations: PlaceLocation[];
}

export default Locations;
