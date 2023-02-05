import { sameLocation, string2Coords, validCoords, Coordinates } from "./geolocation";

const coordsA: Coordinates = { latitude: 39.93337247405423, longitude: 115.8220176339121 };
const coordsB: Coordinates = { latitude: 39.935005470223764, longitude: 115.82701190714252 };
const coordsC: Coordinates = { latitude: 40.935005470223764, longitude: 114.82701190714252 };
const coordsD: Coordinates = { latitude: 39.93530573984925, longitude: 115.82793458704106 };

test('sameLocation({ latitude: 39.93337247405423, longitude: 115.8220176339121 }, { latitude: 39.935005470223764, longitude: 115.82701190714252 }) === true', () => {
    expect(sameLocation(coordsA, coordsB, 0.5)).toBe(true);
});

test('sameLocation({ latitude: 39.93337247405423, longitude: 115.8220176339121 }, { latitude: 40.935005470223764, longitude: 114.82701190714252 }) === true', () => {
    expect(sameLocation(coordsA, coordsC, 0.5)).toBe(false);
});

test('sameLocation({ latitude: 39.93337247405423, longitude: 115.8220176339121 }, { latitude: 39.93530573984925, longitude: 115.82793458704106 }) === true', () => {
    expect(sameLocation(coordsA, coordsD, 0.5)).toBe(false);
});

test('string2Coords(39.93530573984925, 115.82793458704106) === { latitude: 39.93530573984925, longitude: 115.82793458704106 }', () => {
    expect(string2Coords('39.93530573984925, 115.82793458704106')).toEqual({ latitude: 39.93530573984925, longitude: 115.82793458704106 });
    expect(string2Coords('39.93530573984925,115.82793458704106')).toEqual({ latitude: 39.93530573984925, longitude: 115.82793458704106 });
    expect(string2Coords('39.93530573984925,115.82793458704106extraInput')).toEqual({ latitude: 39.93530573984925, longitude: 115.82793458704106 });
});

test('string2Coords(\'\') to throw ...', () => {
    expect(() => string2Coords('')).toThrowError('Not a valid coordinates representation: \"\"');
});

test('string2Coords(\'39.93530573984925\') to throw ...', () => {
    expect(() => string2Coords('39.93530573984925')).toThrowError('Not a valid coordinates representation: \"39.93530573984925\"');
});

test('string2Coords(\'39.93530573984925,\') to throw ...', () => {
    expect(() => string2Coords('39.93530573984925,')).toThrowError('Not a valid coordinates representation: \"39.93530573984925,\"');
});

test('validCoords(39.93530573984925, 115.82793458704106) === true', () => {
    expect(validCoords('39.93530573984925, 115.82793458704106')).toBe(true);
    expect(validCoords('39.93530573984925,115.82793458704106')).toBe(true);
    expect(validCoords('39.93530573984925,115.82793458704106extraInput')).toBe(true);
});

test('validCoords(\'\') to throw ...', () => {
    expect(validCoords('')).toBe(false);
});

test('validCoords(\'39.93530573984925\') to throw ...', () => {
    expect(validCoords('39.93530573984925')).toBe(false);
});

test('validCoords(\'39.93530573984925,\') to throw ...', () => {
    expect(validCoords('39.93530573984925,')).toBe(false);
});
