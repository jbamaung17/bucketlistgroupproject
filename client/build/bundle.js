/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

const Request = __webpack_require__(1);
const CountryView = __webpack_require__(2);
const MapWrapper = __webpack_require__(3);

const allCountriesRequest = new Request("https://restcountries.eu/rest/v2/all")
const dbrequest = new Request("/api/countries");

const countryView = new CountryView();



const getCountryDetails = function(country) {
  const countryDetails = {
    name: country.name,
    population: country.population,
    capital: country.capital,
    flag: country.flag,
    latlng: country.latlng
  };

  return countryDetails;
}

const populateCountriesList = function(allCountries) {

  const countrySelector = document.getElementById('country-select');

  for (let country of allCountries) {
    const option = document.createElement('option');
    const countryDetails = getCountryDetails(country);
    option.value = JSON.stringify(countryDetails); // value is JSON object
    option.innerText = country.name;
    countrySelector.appendChild(option);
  }

}

const populateBucketList = function(countries) {
  countries.forEach(country => countryView.addCountry(country));
}


const saveCountry = function() {
  const selector = document.getElementById('country-select');
  const selectedCountryJSON = selector.value;
  console.log("selector", selector.value);
  const selectedCountryObj = JSON.parse(selectedCountryJSON);

  dbrequest.post(saveRequestComplete, selectedCountryObj);
}

const saveRequestComplete = function(countryToSave) {
  countryView.addCountry(countryToSave);
}


const initializeMap = function() {
  const container = document.getElementById("bucket-map");
  const center = { lat: 0, lng: 0 };
  const zoom = 2;
  const map = new MapWrapper(container, center, 4);
};




const clearBucketList = function() {
  dbrequest.delete(countryView.clearList);
}


const app = function() {
  allCountriesRequest.get(populateCountriesList);
  initializeMap();
  dbrequest.get(populateBucketList)


  const selectCountryButton = document.getElementById('country-select');
  selectCountryButton.addEventListener('change', function(event) {
    event.preventDefault();
    saveCountry();
    console.log(event);
  });

  const selectClearButton = document.getElementById('delete-button');
  selectClearButton.addEventListener('click', clearBucketList)
};



document.addEventListener('DOMContentLoaded', app)


/***/ }),
/* 1 */
/***/ (function(module, exports) {

const Request = function(url){
  this.url = url;
}

Request.prototype.get = function(callback){
  const request = new XMLHttpRequest();
  request.open("GET", this.url);
  request.addEventListener("load", function(){
    if(this.status !==200){
      return;
    }
    const responseBody = JSON.parse(this.responseText);
    callback(responseBody);
  });
  request.send();
};

Request.prototype.post = function(callback, body){
  const request = new XMLHttpRequest();
  request.open("POST", this.url);
  request.setRequestHeader("Content-Type", "application/json");

  request.addEventListener("load", function(){
    if(this.status !== 201){
      return;
    }

    const responseBody = JSON.parse(this.responseText);
    callback(responseBody);
  });
  request.send(JSON.stringify(body));
};

Request.prototype.delete = function(callback){
  const request = new XMLHttpRequest();
  request.open("DELETE", this.url);
  request.addEventListener("load", function(){
    if(this.status !==204){
      return;
    }
    callback();
  });
  request.send();
};

Request.prototype.removeCountryFromList = function (countryID) {
};


module.exports = Request;


/***/ }),
/* 2 */
/***/ (function(module, exports) {

const CountryView = function() {
  this.countries = [];
}

CountryView.prototype.addCountry = function(country) {
  this.countries.push(country);
  this.render(country);
};

CountryView.prototype.render = function(country) {
  const bucketList = document.getElementById('country-list');

  const li = this.formatCountryData(country);
  bucketList.appendChild(li);
};

CountryView.prototype.formatCountryData = function(country) {
  const li = document.createElement('li');
  li.className = 'country-list-item';
  const span = document.createElement('span')
  // name
  const name = document.createElement('span');
  name.className = 'countryName';
  name.innerText = `${country.name}`;

  // flag
  const flag = document.createElement('img');
  flag.className = 'flag-img';
  flag.setAttribute("width", 50)
  flag.src = country.flag;
  li.appendChild(span);
  span.appendChild(flag);
  span.appendChild(name);
  return li;
};

CountryView.prototype.clearList = function() {
  this.countries = [];
  const bucketList = document.getElementById('bucket-list');
  bucketList.innerHTML = "";
};

module.exports = CountryView;


/***/ }),
/* 3 */
/***/ (function(module, exports) {



const MapWrapper = function (container, coords, zoom) {
  this.googleMap = new google.maps.Map(container, {
    center: coords,
    zoom: zoom,
    style: [
    {
        "featureType": "administrative.locality",
        "elementType": "labels.text.fill",
        "stylers": [
            {
                "color": "#00a7b5"
            },
            {
                "visibility": "on"
            }
        ]
    },
    {
        "featureType": "administrative.neighborhood",
        "elementType": "labels.text.fill",
        "stylers": [
            {
                "color": "#ef7a7d"
            }
        ]
    },
    {
        "featureType": "landscape.man_made",
        "elementType": "geometry.fill",
        "stylers": [
            {
                "color": "#d6d6d6"
            }
        ]
    },
    {
        "featureType": "landscape.natural",
        "elementType": "geometry.fill",
        "stylers": [
            {
                "visibility": "on"
            },
            {
                "color": "#e3e3e3"
            }
        ]
    },
    {
        "featureType": "poi",
        "elementType": "geometry.fill",
        "stylers": [
            {
                "color": "#d7d7d7"
            },
            {
                "visibility": "on"
            }
        ]
    },
    {
        "featureType": "poi",
        "elementType": "labels.text.fill",
        "stylers": [
            {
                "color": "#595959"
            }
        ]
    },
    {
        "featureType": "road",
        "elementType": "geometry",
        "stylers": [
            {
                "visibility": "simplified"
            },
            {
                "color": "#c6c6c6"
            }
        ]
    },
    {
        "featureType": "road",
        "elementType": "labels",
        "stylers": [
            {
                "visibility": "off"
            }
        ]
    },
    {
        "featureType": "road",
        "elementType": "labels.text",
        "stylers": [
            {
                "visibility": "simplified"
            },
            {
                "color": "#757575"
            }
        ]
    },
    {
        "featureType": "road.highway",
        "elementType": "geometry.fill",
        "stylers": [
            {
                "color": "#00a7b5"
            }
        ]
    },
    {
        "featureType": "transit.line",
        "elementType": "geometry",
        "stylers": [
            {
                "visibility": "on"
            },
            {
                "lightness": 700
            },
            {
                "color": "#999999"
            }
        ]
    },
    {
        "featureType": "water",
        "elementType": "all",
        "stylers": [
            {
                "color": "#7dcdcd"
            }
        ]
    },
    {
        "featureType": "water",
        "elementType": "geometry.fill",
        "stylers": [
            {
                "color": "#bbcfe3"
            }
        ]
    }
]

  });
}

MapWrapper.prototype.addMarker = function (coords) {
  var bucketImage = {
    url: 'bucket.svg',
    scaledSize: new google.maps.Size(35, 35)
};

  var marker = new google.maps.Marker({
    position: coords,
    map: this.googleMap,
    icon: bucketImage,
    animation: google.maps.Animation.DROP
  });
  return marker;
}

MapWrapper.prototype.addClickEvent = function () {
  google.maps.event.addListener(this.googleMap, 'click', function (event) {
    var position = { lat: event.latLng.lat(), lng: event.latLng.lng() }
    this.addMarker(position);
  }.bind(this));
}

MapWrapper.prototype.addInfoWindow = function (coords, text) {
  var marker = this.addMarker(coords);
  marker.addListener('click', function () {
    var infoWindow = new google.maps.InfoWindow({
      content: text
    });
    infoWindow.open(this.map, marker);
  });
}

  // Make Map

MapWrapper.prototype.initializeMap = function(country) {
    const mapDiv = document.getElementById('bucket-map');
    const center = { lat: country.lat, lng: country.lng };
    const mainMap = new MapWrapper(mapDiv, center, 16);

    mainMap.addInfoWindow(center, `<h2>${country.name}</h2>`); //+
  }


MapWrapper.prototype.geoLocate = function () {
  navigator.geolocation.getCurrentPosition(function (position) {
    var center = { lat: position.coords.latitude, lng: position.coords.longitude };
    this.googleMap.setCenter(center);
    this.addMarker(center);
  }.bind(this));
}

module.exports = MapWrapper;


/***/ })
/******/ ]);
//# sourceMappingURL=bundle.js.map