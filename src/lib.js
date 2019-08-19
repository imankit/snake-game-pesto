const lib = {
  getRange: (x) => {
    return [...Array(x).keys()];
  },

  getRandomInt: (max) => {
    return Math.floor(Math.random() * max);
  },

  positionToCoordinates: (position, size) => {
    return [Math.floor(position / size), position % size];
  },

  coordinatesToPosition: (coordinates, size) => {
    return size * coordinates[0] + coordinates[1];
  },

  keyToDirection: (key) => {
    switch (key) {
      case 'ArrowUp':
        return 'Up';

      case 'ArrowRight':
        return 'Right';

      case 'ArrowDown':
        return 'Down';

      case 'ArrowLeft':
        return 'Left';

      default:
        return null;
    }
  },
  // only if obj doesn't contain functions
  deepClone: (obj) => JSON.parse(JSON.stringify(obj)),
};

export default lib;
