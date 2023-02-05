export type Coordinates = {
    latitude: number;
    longitude: number;
};

export function degreesToRadians(degrees: number): number {
    var radians = (degrees * Math.PI) / 180;
    return radians;
}

export function calcDistance(coords1: Coordinates, coords2: Coordinates): number {
    let lat1 = degreesToRadians(coords1.latitude);
    let long1 = degreesToRadians(coords1.longitude);
    let lat2 = degreesToRadians(coords2.latitude);
    let long2 = degreesToRadians(coords2.longitude);

    // Radius of the Earth in kilometers
    let radius = 6571;

    // Haversine equation
    let distanceInKilometers = Math.acos(Math.sin(lat1) * Math.sin(lat2) + Math.cos(lat1) * Math.cos(lat2) * Math.cos(long1 - long2)) * radius;
    return distanceInKilometers;
}

export function sameLocation(coords1: Coordinates, coords2: Coordinates, maxDistance: number): boolean {
    return calcDistance(coords1, coords2) < maxDistance;
}

export function string2Coords(stringCoords: string): Coordinates {
    const coordParts = stringCoords.split(/\s*,\s*/);
    if (coordParts.length < 2 || Number.isNaN(Number.parseFloat(coordParts[0].trim())) || Number.isNaN(Number.parseFloat(coordParts[1].trim()))) {
        throw new Error("Not a valid coordinates representation: \"" + stringCoords + "\"");
    }
    return { latitude: Number.parseFloat(coordParts[0].trim()), longitude: Number.parseFloat(coordParts[1].trim()) };
}

export function validCoords(stringCoords: string): boolean {
    try {
        string2Coords(stringCoords);
        return true;
    } catch (error) {
        return false;
    }
}

export function coords2String(coords: Coordinates): string {
    return '' + coords.latitude + ', ' + coords.longitude;
}
