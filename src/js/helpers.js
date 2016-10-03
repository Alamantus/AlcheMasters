export function dynamicSort(propertiesArray) {
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

export function colorToElement(color) {
  switch (color) {
    case 'red': return 'fire';
    case 'orange': return 'light';
    case 'yellow': return 'electricity';
    case 'green': return 'growth';
    case 'blue': return 'water';
    case 'purple': return 'ice';
    case 'white': return 'wind';
    case 'black': return 'darkness';
  }
}

export function capitalizeString(string) {
  return string[0].toUpperCase() + string.substr(1);
}
