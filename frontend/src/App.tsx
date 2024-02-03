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
    <div className='flex flex-col justify-center'>
      <div className='flex flex-col flex-none p-3 bg-slate-200 border-slate-200 border-8 rounded-xl'>
        <div className='flex'>
          <label htmlFor='datePicker' className='m-auto'>Month</label>
        </div>
        <div className='flex-none m-auto'>
          <DatePicker
            id='datePicker'
            selected={new Date(epoch)}
            onChange={date => setEpoch(date ? date.getTime() : lastMonth())}
            dateFormat='MM-yyyy'
            showMonthYearPicker
            className='m-auto text-center'
          />
        </div>
      </div>
      <div className='flex-auto mt-2 mb-2 p-2 bg-slate-200 border-slate-200 border-8 rounded-xl'>
        <div className='flex'>
          <label htmlFor='coordinates' className='m-auto'>Coordinates</label>
        </div>
        <div className='flex'>
          <input id='coordinates' type='text' value={coords2String(coordinates)} onChange={(event) => {
            setCoordinates(string2Coords(event.target.value));
            window.localStorage.setItem('coordinates', event.target.value);
          }} className='m-auto w-40ch' />
        </div>
      </div>
      <div className='flex-auto p-2 bg-slate-200 border-slate-200 border-8 rounded-xl'>
        <div className='text-center'>Locations</div>
        <div className='overflow-scroll flex'>
          <div className='flex-none w-1920 pb-3 m-auto'>
            {daysAtTargetGraph(locations.epoch, coordinates, locations.locations)}
            {renderLocationsSection(locations)}
          </div>
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
