export const colorElementMap = {
  red: 'fire',
  fire: 'red',
  orange: 'light',
  light: 'orange',
  yellow: 'electricity',
  electricity: 'yellow',
  green: 'growth',
  growth: 'green',
  blue: 'water',
  water: 'blue',
  purple: 'ice',
  ice: 'purple',
  white: 'wind',
  wind: 'white',
  black: 'darkness',
  darkness: 'black'
};

export function dynamicSort (propertiesArray) {
  /* Retrieved from http://stackoverflow.com/a/30446887/3508346
     Usage: theArray.sort(dynamicSort(['propertyAscending', '-propertyDescending']));*/
    return function (a, b) {
        return propertiesArray
            .map(function (o) {
                var dir = 1;
                if (o[0] === '-') {
                   dir = -1;
                   o=o.substring(1);
                }
                if (removeDiacritics(a[o]).toLowerCase() > removeDiacritics(b[o]).toLowerCase()) return dir;
                if (removeDiacritics(a[o]).toLowerCase() < removeDiacritics(b[o]).toLowerCase()) return -(dir);
                return 0;
            })
            .reduce(function firstNonZeroValue (p,n) {
                return p ? p : n;
            }, 0);
    };
}

export function capitalizeString (string) {
  return string[0].toUpperCase() + string.substr(1);
}

export function square (value) {
  return value * value;
}

export function getRandom (min, max) {
  return Math.random() * (max - min) + min;
}

export function getRandomInt (min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

export function radians(angle) {
  return angle * (Math.PI / 180);
}
