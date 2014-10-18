'use strict';

angular.module('mgcrea.ngStrap.helpers.parseOptions', [])

  .provider('$parseOptions', function() {

    var defaults = this.defaults = {
      regexp: /^\s*(.*?)(?:\s+as\s+(.*?))?(?:\s+group\s+by\s+(.*))?\s+for\s+(?:([\$\w][\$\w]*)|(?:\(\s*([\$\w][\$\w]*)\s*,\s*([\$\w][\$\w]*)\s*\)))\s+in\s+(.*?)(?:\s+track\s+by\s+(.*?))?$/
    };

    this.$get = function($parse, $q) {

      function ParseOptionsFactory(attr, config) {

        var $parseOptions = {};

        // Common vars
        var options = angular.extend({}, defaults, config);
        $parseOptions.$values = [];
        $parseOptions.itemsSource = '';

        // Private vars
        var match, displayFn, valueName, keyName, groupByFn, valueFn, valuesFn;

        $parseOptions.init = function() {
          $parseOptions.$match = match = attr.match(options.regexp);
          displayFn = $parse(match[2] || match[1]),
          valueName = match[4] || match[6],
          keyName = match[5],
          groupByFn = $parse(match[3] || ''),
          valueFn = $parse(match[2] ? match[1] : valueName),
          valuesFn = $parse(match[7]);
          $parseOptions.itemsSource = match[7].replace(/\|.+/, '').replace(/\(.*\)/g, '').trim();
        };

        $parseOptions.valuesFn = function(scope, controller) {
          return $q.when(valuesFn(scope, controller))
          .then(function(values) {
            $parseOptions.$values = values ? parseValues(values, scope) : {};
            return $parseOptions.$values;
          });
        };

        $parseOptions.getLabelForItem = function(item){
          var scope = {};
          scope[valueName] = item;
          return displayFn(scope);
        };

        $parseOptions.getValueForItem = function(item){
          var scope = {};
          scope[valueName] = item;
          return valueFn(scope);
        };

        $parseOptions.getLabelForValue = function(value){
          var item = getItem('value', value, true);
          return item ? item.label : undefined;
        };

        $parseOptions.getValueForLabel = function(label){
          var item = getItem('label', label, false);
          return item ? item.value : undefined;
        };

        $parseOptions.getIndexForValue = function(value){
          var item = getItem('value', value, true);
          return item ? item.index : undefined;
        };

        $parseOptions.displayValue = function(modelValue) {
          var scope = {};
          scope[valueName] = modelValue;
          return displayFn(scope);
        };

        // Private functions

        function parseValues(values, scope) {
          return values.map(function(match, index) {
            var locals = {}, label, value;
            locals[valueName] = match;
            label = displayFn(scope, locals);
            value = valueFn(scope, locals);
            return {label: label, value: value, index: index};
          });
        }

        function getItem(prop, value, isCaseSensitive) {
          var itemsCount = $parseOptions.$values.length, i = itemsCount;
          // no values to match, so return undefined
          if(!itemsCount) return undefined;

          for(i = itemsCount; i--;) {
            if((!isCaseSensitive && angular.equals(angular.lowercase($parseOptions.$values[i][prop]), angular.lowercase(value))) ||
              angular.equals($parseOptions.$values[i][prop], value)) break;
          }

          // no item found with prop value equal to value, return undefined
          if(i < 0) return undefined;

          // return found item
          return $parseOptions.$values[i];
        }

        $parseOptions.init();
        return $parseOptions;

      }

      return ParseOptionsFactory;

    };

  });
