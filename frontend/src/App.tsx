import DatePicker from 'react-datepicker';
import { startOfMonth, subMonths, addMonths, differenceInDays, format } from 'date-fns';
import Locations, { PlaceLocation } from './PlaceLocation';
import React, { ReactElement, ReactNode, useEffect, useState } from 'react';
import 'react-datepicker/dist/react-datepicker.css';
import svgStyles from './svg.module.css';
import { Coordinates, coords2String, sameLocation, string2Coords, validCoords } from './geolocation';

function App() {
  const [epoch, setEpoch] = useState<number>(lastMonth());
  const [locations, setLocations] = useState(() => fetchLocations(epoch));
  const [coordinates, setCoordinates] = useState<Coordinates>(() => {
    const storedLocation = window.localStorage.getItem('coordinates') ?? '';
    return validCoords(storedLocation) ? string2Coords(storedLocation) : { latitude: 0, longitude: 0 };
  });

  useEffect(() => setLocations(fetchLocations(epoch)), [epoch]);

  return (
    <div className='mx-auto w-full'>
      <div className='mx-auto grid grid-cols-1 place-content-center w-full'>
        <DatePicker
          selected={new Date(epoch)}
          onChange={date => setEpoch(date ? date.getTime() : lastMonth())}
          dateFormat='MM-yyyy'
          showMonthYearPicker
          className='block m-auto text-center' />
        <label htmlFor='coordinates' className='m-auto'>Coordinates</label>
        <div className='m-auto'>
          <input id='coordinates' type='text' value={coords2String(coordinates)} onChange={(event) => {
            setCoordinates(string2Coords(event.target.value));
            window.localStorage.setItem('coordinates', event.target.value);
          }} />
        </div>
      </div>
      <div className='mx-auto grid grid-cols-1 place-content-center w-full'>
        <div className='text-center'>Locations:</div>
        <div>
          {daysAtTargetGraph(locations.epoch, coordinates, locations.locations)}
          {renderLocationsSection(locations)}
        </div>
      </div>
    </div>
  );

  function renderLocationsSection(locations: Locations): ReactNode | undefined {
    if (locations.fetching) {
      return <div className='flex justify-center items-center'>
        <div className='spinner-border animate-spin inline-block w-8 h-8 border-4 rounded-full' role='status'>
          <span className='visually-hidden'>Loading ...</span>
        </div>
      </div>
    } else {
      if (locations.errMsg !== undefined) {
        return <span>{locations.errMsg}</span>
      }
    }
  }

  function renderLocations(locations: PlaceLocation[]): ReactElement {
    console.log(locations);
    const locationsItems: ReactNode[] = locations.map((location) =>
      <li key={location.time} >time: {format(new Date(location.time * 1000), "dd-MM HH:mm")}, latitude: {location.latitude}, longitude: {location.longitude}, atTarget: {sameLocation(location2Coords(location), coordinates, 0.5) ? 'yes' : 'no'}</li>
    );
    return (
      <ul>{locationsItems}</ul>
    )
  }

  function location2Coords(location: PlaceLocation): Coordinates {
    return { latitude: location.latitude, longitude: location.longitude };
  }

  function lastMonth(): number | (() => number) {
    return subMonths(startOfMonth(new Date()), 1).getTime();
  }


  function fetchLocations(epoch: number): Locations {
    const href = window.location.href;
    const apiUrl = href.substring(0, href.lastIndexOf('/') ?? href.length) + '/locations?from=' + Math.round(epoch / 1000) + '&to=' + Math.round(addMonths(new Date(epoch), 1).getTime() / 1000);
    console.log('URL: ' + apiUrl);
    fetch(apiUrl)
      .then(value => {
        value.json()
          .then(value => {
            setLocations({ epoch: epoch, fetching: false, locations: value as PlaceLocation[] })
          })
          .catch(reason => {
            setLocations({ epoch: epoch, fetching: false, errMsg: 'error while calling json(): ' + (reason ?? 'unknown error'), locations: [] })
          });
      })
      .catch(reason => {
        setLocations({ epoch: epoch, fetching: false, errMsg: 'error while calling json(): ' + (reason ?? 'unknown error'), locations: [] })
      });
    return { epoch: epoch, fetching: true, locations: [] };
  }
}

const daysAtTargetGraph = (epoch: number, coordinates: Coordinates, locations: PlaceLocation[]) => {
  const days = differenceInDays(addMonths(new Date(epoch), 1), new Date(epoch));
  console.log('days: ' + days);
  const dayMarkers: ReactNode[] = Array.from({ length: days }, (value, index) => index).map((day) => {
    return (
      <React.Fragment key={day}>
        <text x={day * 30 + 15} y={10} textAnchor='middle' className={svgStyles.text}>{day + 1}</text>
        <line x1={day * 30} x2={day * 30} y1={0} y2={23} stroke='black' />
      </React.Fragment>
    );
  });
  const locMarkers = locations
    .filter((location, i, arr) => i > 0 && !sameLocation(placeLocation2Coords(arr[i - 1]), placeLocation2Coords(arr[i]), 0.5))
    .map((location, i, arr) => {
      const prevLocation = i === 0 ? locations[0] : arr[i - 1];
      const x = (prevLocation.time - epoch / 1000) / 86400 * 30;
      const width = (location.time - epoch / 1000) / 86400 * 30 - (x >= 0 ? x : 0);
      if (sameLocation(placeLocation2Coords(prevLocation), coordinates, 0.5)) {
        return <rect key={JSON.stringify({ x: x >= 0 ? x : 0, width: width })} x={x >= 0 ? x : 0} width={width} y={14} height={6} />
      } else {
        return <></>
      }
    })
  const missingMarkers = locations
    .slice(1)
    .map((location, i, arr) => {
      const prevLocation = i === 0 ? locations[0] : arr[i - 1];
      const moreThanOneDay = (location.time - prevLocation.time) >= 86400;
      const x = (prevLocation.time - epoch / 1000) / 86400 * 30;
      const width = (location.time - epoch / 1000) / 86400 * 30 - (x >= 0 ? x : 0);
      if (moreThanOneDay) {
        return <rect key={JSON.stringify({ x: x >= 0 ? x : 0, width: width })} x={x >= 0 ? x : 0} width={width} y={20} height={4} fill="red" />
      } else {
        return <></>
      }
    })
  return (
    <svg
      viewBox={"0 0 " + (days * 30) + " 24"}
      xmlns="<http://www.w3.org/2000/svg>"
    >
      {dayMarkers}
      {locMarkers}
      {missingMarkers}
    </svg>
  )
}

const placeLocation2Coords = (location: PlaceLocation) => { return { latitude: location.latitude, longitude: location.longitude } };

export default App;
