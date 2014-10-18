'use strict';

describe('parseOptions', function () {

  var $compile, scope, $parseOptions;

  beforeEach(module('mgcrea.ngStrap.helpers.parseOptions'));

  beforeEach(inject(function (_$rootScope_, _$compile_, _$parseOptions_) {
    scope = _$rootScope_;
    $compile = _$compile_;
    $parseOptions = _$parseOptions_;
  }));

  function getParsedValues(parsedOptions) {
    var parsedValues = null;

    parsedOptions.valuesFn(scope, null)
      .then(function(values) {
        parsedValues = values;
      });

    scope.$digest();

    return parsedValues;
  }

  var colors = [
    {name:'black', shade:'dark'},
    {name:'white', shade:'light'},
    {name:'red', shade:'dark'},
    {name:'blue', shade:'dark'},
    {name:'yellow', shade:'light'},
    {name:'false', shade:false},
    {name:'', shade:''}
  ];

  // Tests
  function generateParsedValuesLengthTests(parsedValues, optionsArray) {
    expect(parsedValues).toBeDefined();
    expect(parsedValues.length).toBe(optionsArray.length);
  }

  describe('for array data sources', function () {
    describe('with "label for value in array" format', function() {

      it('should support using objects', function() {
        scope.colors = angular.copy(colors);
        var parsedOptions = $parseOptions('color.name for color in colors');
        var parsedValues = getParsedValues(parsedOptions);
        generateParsedValuesLengthTests(parsedValues, scope.colors);

        angular.forEach(parsedValues, function(v) {
          expect(v.label).toBe(scope.colors[v.index].name);
          expect(v.value).toBe(scope.colors[v.index]);
        });
      });

      it('should support using objects with filter', function() {
        scope.colors = angular.copy(colors);

        var parsedOptions = $parseOptions('color.name for color in colors | filter:\'bl\'');
        var parsedValues = getParsedValues(parsedOptions);
        expect(parsedValues).toBeDefined();
        expect(parsedValues.length).toBe(2);
        expect(parsedValues[0].label).toBe(scope.colors[0].name);
        expect(parsedValues[0].value).toBe(scope.colors[0]);
        expect(parsedValues[1].label).toBe(scope.colors[3].name);
        expect(parsedValues[1].value).toBe(scope.colors[3]);
      });

      it('should support using objects with limit', function() {
        scope.colors = angular.copy(colors);

        var parsedOptions = $parseOptions('color.name for color in colors | limitTo:3');
        var parsedValues = getParsedValues(parsedOptions);
        expect(parsedValues).toBeDefined();
        expect(parsedValues.length).toBe(3);

        angular.forEach(parsedValues, function(v) {
          expect(v.label).toBe(scope.colors[v.index].name);
          expect(v.value).toBe(scope.colors[v.index]);
        });
      });

      it('should return label for given item', function() {
        scope.colors = angular.copy(colors);

        var parsedOptions = $parseOptions('color.name for color in colors');
        var parsedValues = getParsedValues(parsedOptions);

        expect(parsedOptions.getLabelForItem(scope.colors[0])).toBe(scope.colors[0].name);
        expect(parsedOptions.getLabelForItem({name:'black', shade:'dark'})).toBe('black');
        expect(parsedOptions.getLabelForItem('bla')).toBe(undefined);
        expect(parsedOptions.getLabelForItem(null)).toBe(undefined);
        expect(parsedOptions.getLabelForItem('abc')).toBe(undefined);
        expect(parsedOptions.getLabelForItem({})).toBe(undefined);
      });

      it('should return value for given item', function() {
        scope.colors = angular.copy(colors);

        var parsedOptions = $parseOptions('color.name for color in colors');
        var parsedValues = getParsedValues(parsedOptions);

        expect(parsedOptions.getValueForItem(scope.colors[0])).toBe(scope.colors[0]);
        expect(parsedOptions.getValueForItem({name:'black', shade:'dark'})).toEqual({name:'black', shade:'dark'});
        expect(parsedOptions.getValueForItem('bla')).toBe('bla');
        expect(parsedOptions.getValueForItem(null)).toBe(null);
        expect(parsedOptions.getValueForItem('')).toBe('');
        expect(parsedOptions.getValueForItem({})).toEqual({});
      });

      it('should return label for given value', function() {
        scope.colors = angular.copy(colors);

        var parsedOptions = $parseOptions('color.name for color in colors');
        var parsedValues = getParsedValues(parsedOptions);

        expect(parsedOptions.getLabelForValue(scope.colors[0])).toBe(scope.colors[0].name);
        expect(parsedOptions.getLabelForValue({name:'black', shade:'dark'})).toBe(scope.colors[0].name);
        expect(parsedOptions.getLabelForValue('black')).toBe(undefined);
        expect(parsedOptions.getLabelForValue(null)).toBe(undefined);
        expect(parsedOptions.getLabelForValue('abc')).toBe(undefined);
        expect(parsedOptions.getLabelForValue({})).toBe(undefined);
      });

      it('should return value for given label', function() {
        scope.colors = angular.copy(colors);

        var parsedOptions = $parseOptions('color.name for color in colors');
        var parsedValues = getParsedValues(parsedOptions);

        expect(parsedOptions.getValueForLabel(scope.colors[0].name)).toBe(scope.colors[0]);
        expect(parsedOptions.getValueForLabel('black')).toBe(scope.colors[0]);
        expect(parsedOptions.getValueForLabel('BLACK')).toBe(scope.colors[0]);
        expect(parsedOptions.getValueForLabel('bla')).toBe(undefined);
        expect(parsedOptions.getValueForLabel(null)).toBe(undefined);
        expect(parsedOptions.getValueForLabel('abc')).toBe(undefined);
        expect(parsedOptions.getValueForLabel({})).toBe(undefined);
      });

      it('should return index for given item', function() {
        scope.colors = angular.copy(colors);

        var parsedOptions = $parseOptions('color.name for color in colors | filter:\'bl\'');
        var parsedValues = getParsedValues(parsedOptions);

        expect(parsedOptions.getIndexForValue(scope.colors[0])).toBe(0);
        expect(parsedOptions.getIndexForValue(scope.colors[3])).toBe(1);
        expect(parsedOptions.getIndexForValue({name:'black', shade:'dark'})).toEqual(0);
        expect(parsedOptions.getIndexForValue('bla')).toBe(undefined);
        expect(parsedOptions.getIndexForValue(null)).toBe(undefined);
        expect(parsedOptions.getIndexForValue('')).toBe(undefined);
        expect(parsedOptions.getIndexForValue({})).toEqual(undefined);
      });

      it('should correctly parse options source', function() {
        var parsedOptions = $parseOptions('color.name for color in colors | filter:$viewValue | limitTo:3');
        expect(parsedOptions.itemsSource).toBe('colors');
      });

      it('should support basic value types', function() {
        scope.values = [
          'true',
          'false',
          true,
          false,
          0,
          1,
          14.5,
          18.3,
          0.0,
          -1,
          new Date()
        ];
        var parsedOptions = $parseOptions('val for val in values');
        var parsedValues = getParsedValues(parsedOptions);
        generateParsedValuesLengthTests(parsedValues, scope.values);

        angular.forEach(parsedValues, function(v) {
          expect(v.label).toBe(scope.values[v.index]);
          expect(v.value).toBe(scope.values[v.index]);
        });
      });

      it('should support boolean values', function() {
        scope.values = [
          true,
          false
        ];
        var parsedOptions = $parseOptions('val for val in values');
        var parsedValues = getParsedValues(parsedOptions);
        generateParsedValuesLengthTests(parsedValues, scope.values);

        angular.forEach(parsedValues, function(v) {
          expect(v.label).toBe(scope.values[v.index]);
          expect(v.value).toBe(scope.values[v.index]);
        });
      });

      it('should support null/undefined/empty string values', function() {
        scope.values = [
          'true',
          undefined,
          'false',
          '',
          null
        ];
        var parsedOptions = $parseOptions('val for val in values');
        var parsedValues = getParsedValues(parsedOptions);
        generateParsedValuesLengthTests(parsedValues, scope.values);

        angular.forEach(parsedValues, function(v) {
          expect(v.label).toBe(scope.values[v.index]);
          expect(v.value).toBe(scope.values[v.index]);
        });
      });

    });

    describe('with "select as label for value in array" format', function() {

      it('should support using objects', function() {
        scope.colors = angular.copy(colors);

        var parsedOptions = $parseOptions('color.shade as color.name for color in colors');
        var parsedValues = getParsedValues(parsedOptions);
        generateParsedValuesLengthTests(parsedValues, scope.colors);

        angular.forEach(parsedValues, function(v) {
          expect(v.label).toBe(scope.colors[v.index].name);
          expect(v.value).toBe(scope.colors[v.index].shade);
        });
      });

      it('should support using objects with index as value', function() {
        scope.colors = angular.copy(colors);
        var parsedOptions = $parseOptions('colors.indexOf(color) as color.name for color in colors');
        var parsedValues = getParsedValues(parsedOptions);
        generateParsedValuesLengthTests(parsedValues, scope.colors);

        angular.forEach(parsedValues, function(v) {
          expect(v.label).toBe(scope.colors[v.index].name);
          expect(v.value).toBe(v.index);
        });
      });

      it('should support using objects with filter', function() {
        scope.colors = angular.copy(colors);

        var parsedOptions = $parseOptions('color.shade as color.name for color in colors | filter:\'bl\'');
        var parsedValues = getParsedValues(parsedOptions);
        expect(parsedValues).toBeDefined();
        expect(parsedValues.length).toBe(2);
        expect(parsedValues[0].label).toBe(scope.colors[0].name);
        expect(parsedValues[0].value).toBe(scope.colors[0].shade);
        expect(parsedValues[1].label).toBe(scope.colors[3].name);
        expect(parsedValues[1].value).toBe(scope.colors[3].shade);
      });

      it('should support using objects with limit', function() {
        scope.colors = angular.copy(colors);

        var parsedOptions = $parseOptions('color.shade as color.name for color in colors | limitTo:3');
        var parsedValues = getParsedValues(parsedOptions);
        expect(parsedValues).toBeDefined();
        expect(parsedValues.length).toBe(3);

        angular.forEach(parsedValues, function(v) {
          expect(v.label).toBe(scope.colors[v.index].name);
          expect(v.value).toBe(scope.colors[v.index].shade);
        });
      });

      it('should return label for given item', function() {
        scope.colors = angular.copy(colors);

        var parsedOptions = $parseOptions('color.shade as color.name for color in colors');
        var parsedValues = getParsedValues(parsedOptions);

        expect(parsedOptions.getLabelForItem(scope.colors[0])).toBe(scope.colors[0].name);
        expect(parsedOptions.getLabelForItem({name:'black', shade:'dark'})).toBe('black');
        expect(parsedOptions.getLabelForItem('bla')).toBe(undefined);
        expect(parsedOptions.getLabelForItem(null)).toBe(undefined);
        expect(parsedOptions.getLabelForItem('abc')).toBe(undefined);
        expect(parsedOptions.getLabelForItem({})).toBe(undefined);
      });

      it('should return value for given item', function() {
        scope.colors = angular.copy(colors);

        var parsedOptions = $parseOptions('color.shade as color.name for color in colors');
        var parsedValues = getParsedValues(parsedOptions);

        expect(parsedOptions.getValueForItem(scope.colors[0])).toBe(scope.colors[0].shade);
        expect(parsedOptions.getValueForItem({name:'black', shade:'dark'})).toBe('dark');
        expect(parsedOptions.getValueForItem('bla')).toBe(undefined);
        expect(parsedOptions.getValueForItem(null)).toBe(undefined);
        expect(parsedOptions.getValueForItem('abc')).toBe(undefined);
        expect(parsedOptions.getValueForItem({})).toBe(undefined);
      });

      it('should return label for given value', function() {
        scope.colors = angular.copy(colors);

        var parsedOptions = $parseOptions('color.name + color.shade as color.name for color in colors');
        var parsedValues = getParsedValues(parsedOptions);

        expect(parsedOptions.getLabelForValue(scope.colors[0].name + scope.colors[0].shade)).toBe(scope.colors[0].name);
        expect(parsedOptions.getLabelForValue({name:'black', shade:'dark'})).toBe(undefined);
        expect(parsedOptions.getLabelForValue('blackdark')).toBe(scope.colors[0].name);
        expect(parsedOptions.getLabelForValue(null)).toBe(undefined);
        expect(parsedOptions.getLabelForValue('abc')).toBe(undefined);
        expect(parsedOptions.getLabelForValue('')).toBe(scope.colors[6].name);
        expect(parsedOptions.getLabelForValue({})).toBe(undefined);
      });

      it('should return value for given label', function() {
        scope.colors = angular.copy(colors);

        var parsedOptions = $parseOptions('color.shade as color.name for color in colors');
        var parsedValues = getParsedValues(parsedOptions);

        expect(parsedOptions.getValueForLabel(scope.colors[0].name)).toBe(scope.colors[0].shade);
        expect(parsedOptions.getValueForLabel('black')).toBe(scope.colors[0].shade);
        expect(parsedOptions.getValueForLabel('BLACK')).toBe(scope.colors[0].shade);
        expect(parsedOptions.getValueForLabel('bla')).toBe(undefined);
        expect(parsedOptions.getValueForLabel(null)).toBe(undefined);
        expect(parsedOptions.getValueForLabel('abc')).toBe(undefined);
        expect(parsedOptions.getValueForLabel({})).toBe(undefined);
      });

      it('should return index for given item', function() {
        scope.colors = angular.copy(colors);

        var parsedOptions = $parseOptions('colors.indexOf(color) as color.name for color in colors | filter:\'bl\'');
        var parsedValues = getParsedValues(parsedOptions);

        expect(parsedOptions.getIndexForValue(0)).toBe(0);
        expect(parsedOptions.getIndexForValue(3)).toBe(1);
        expect(parsedOptions.getIndexForValue('bla')).toBe(undefined);
        expect(parsedOptions.getIndexForValue(null)).toBe(undefined);
        expect(parsedOptions.getIndexForValue('')).toBe(undefined);
        expect(parsedOptions.getIndexForValue({})).toEqual(undefined);
      });

      it('should correctly parse options source', function() {
        var parsedOptions = $parseOptions('color.name for color in colors | filter:$viewValue | limitTo:3');
        expect(parsedOptions.itemsSource).toBe('colors');
      });

    });

    //
    // TODO: looks like group by it is not implemented yet ?
    //
    // describe('with "label group by group for value in array" format', function() {
    //
    //   it('should support using objects', function() {
    //     scope.colors = [
    //       {name:'black', shade:'dark'},
    //       {name:'white', shade:'light'},
    //       {name:'red', shade:'dark'},
    //       {name:'blue', shade:'dark'},
    //       {name:'yellow', shade:'light'},
    //       {name:'false', shade:false},
    //       {name:'', shade:''}
    //     ];
    //
    //     var parsedOptions = $parseOptions('color.name group by color.shade for color in colors');
    //     var parsedValues = getParsedValues(parsedOptions);
    //     // generateParsedValuesLengthTests(parsedValues, scope.colors);
    //
    //     // angular.forEach(parsedValues, function(v) {
    //     //   expect(v.label).toBe(scope.colors[v.index].name);
    //     //   expect(v.value).toBe(scope.colors[v.index].shade);
    //     // });
    //   });
    //
    // });

  });

  //
  // TODO: looks like this format is not implemented yet
  //
  // describe('for object data sources', function () {
  //   describe('with "label for (key , value) in object" format', function() {
  //
  //     it('should support using objects', function() {
  //       scope.colors = {
  //         black: 'Black',
  //         white: 'White',
  //         red: 'Red',
  //         blue: 'Blue',
  //         yellow: 'Yellow',
  //         none: false
  //       };
  //
  //       var parsedOptions = $parseOptions('value for (key, value) in colors');
  //       var parsedValues = getParsedValues(parsedOptions);
  //       generateParsedValuesLengthTests(parsedValues, scope.colors);
  //     });
  //
  //   });
  //
  // });
});
