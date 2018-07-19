angular.module('ngFormioHelper')
.config(['formioComponentsProvider', function(formioComponentsProvider) {
  formioComponentsProvider.register('resourcefields', {
    title: 'Resource Fields',
    template: 'formio/components/resourcefields.html',
    controller: [
      '$scope',
      '$rootScope',
      '$http',
      'FormioUtils',
      'AppConfig',
      function (
        $scope,
        $rootScope,
        $http,
        FormioUtils,
        AppConfig
      ) {
        var settings = $scope.component;
        var resourceExclude = '';
        $scope.resourceComponents = [];
        if ($rootScope.currentForm && $rootScope.currentForm._id) {
          resourceExclude = '&_id__ne=' + $rootScope.currentForm._id;
        }
        $scope.resourceSelect = {
          type: 'select',
          input: true,
          label: settings.title ? settings.title : 'Select a resource',
          key: 'resource',
          placeholder: settings.placeholder || '',
          dataSrc: 'url',
          data: {url: settings.basePath + '?type=resource' + resourceExclude},
          valueProperty: '_id',
          defaultValue: $scope.data.resource,
          template: '<span>{{ item.title }}</span>',
          multiple: false,
          protected: false,
          unique: false,
          persistent: true,
          validate: {
            required: settings.hasOwnProperty('required') ? settings.required : true
          }
        };

        $scope.propertyField = {
          label: 'Resource Property',
          key: 'property',
          inputType: 'text',
          input: true,
          placeholder: 'Assign this resource to the following property',
          prefix: '',
          suffix: '',
          type: 'textfield',
          defaultValue: $scope.data.property,
          multiple: false
        };

        // Keep track of the available forms on the provided form.
        var formFields = [];

        // Fetch the form information.
        $http.get(AppConfig.apiUrl + settings.basePath + '/' + settings.form).then(function(result) {
          FormioUtils.eachComponent(result.data.components, function(component) {
            if (component.type !== 'button') {
              formFields.push({
                value: component.key,
                label: component.label
              });
            }
          });
        });

        // Watch the selection of a new resource and set the resource field information.
        $scope.$watch('data.resource', function(data) {
          if (!data) { return; }
          $scope.data.fields = $scope.data.fields || {};
          if (data !== $scope.data.resource) {
            $scope.data.resource = data;
          }
          $scope.resourceComponents = [];
          $http.get(AppConfig.apiUrl + settings.basePath + '/' + data).then(function(results) {
            FormioUtils.eachComponent(results.data.components, function(component) {
              if (component.type !== 'button') {
                $scope.resourceComponents.push({
                  type: 'select',
                  input: true,
                  label: component.label,
                  key: component.key,
                  dataSrc: 'values',
                  defaultValue: $scope.data.fields[component.key],
                  data: { values: formFields },
                  validate: {
                    required: component.validate ? (component.validate.required) : false
                  }
                });
              }
            });
          });
        });
      }
    ],
    settings: {
      input: true,
      tableView: false,
      builder: false,
      inputType: 'text',
      inputMask: '',
      label: '',
      key: 'textField',
      placeholder: '',
      prefix: '',
      suffix: '',
      multiple: false,
      defaultValue: '',
      protected: false,
      unique: false,
      persistent: true,
      validate: {
        required: false,
        minLength: '',
        maxLength: '',
        pattern: '',
        custom: '',
        customPrivate: false
      }
    }
  });
}]);