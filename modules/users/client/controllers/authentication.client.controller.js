(function () {
  'use strict';

  angular
    .module('users')
    .controller('AuthenticationController', AuthenticationController);

  AuthenticationController.$inject = ['$scope', '$state', 'UsersService', '$location', '$window', 'Authentication', 'PasswordValidator', 'Notification'];

  function AuthenticationController($scope, $state, UsersService, $location, $window, Authentication, PasswordValidator, Notification) {
    var vm = this;

    vm.authentication = Authentication;
    vm.getPopoverMsg = PasswordValidator.getPopoverMsg;
    vm.signup = signup;
    vm.signin = signin;
    vm.callOauthProvider = callOauthProvider;
    vm.usernameRegex = /^(?=[\w.-]+$)(?!.*[._-]{2})(?!\.)(?!.*\.$).{3,34}$/;

    // Get an eventual error defined in the URL query string:
    if ($location.search().err) {
      Notification.error({message: $location.search().err});
    }

    // If user is signed in then redirect back home
    /*if (vm.authentication.user) {
      $location.path('/');
    }*/

    function signup(isValid) {

      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.userForm');

        return false;
      }

      UsersService.userSignup(vm.credentials)
        .then(onUserSignupSuccess)
        .catch(onUserSignupError);
    }

    function signin(isValid) {

      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.userForm');

        return false;
      }

      UsersService.userSignin(vm.credentials)
        .then(onUserSigninSuccess)
        .catch(onUserSigninError);
    }

    // OAuth provider request
    function callOauthProvider(url) {
      if ($state.previous && $state.previous.href) {
        url += '?redirect_to=' + encodeURIComponent($state.previous.href);
      }

      // Effectively call OAuth authentication route:
      $window.location.href = url;
    }

    // Authentication Callbacks

    function onUserSignupSuccess(response) {
      // If successful we assign the response to the global user model
      vm.authentication.user = response;
      Notification.success({message: '<i class="glyphicon glyphicon-ok"></i> Signup successful!'});
      // And redirect to the previous or home page
      $state.go('authentication.subscribe');
    }

    function onUserSignupError(response) {
      Notification.error({
        message: response.data.message,
        title: '<i class="glyphicon glyphicon-remove"></i> Signup Error!',
        delay: 6000
      });
    }

    function onUserSigninSuccess(response) {
      // If successful we assign the response to the global user model
      vm.authentication.user = response;
      Notification.info({message: 'Welcome ' + response.firstName});
      // And redirect to the previous or home page
      if (vm.authentication.user.roles.toString() === 'guest') {
        $state.go('authentication.subscribe');
      }
      else {
        $state.go('articles.list');
      }
    }

    function onUserSigninError(response) {
      Notification.error({
        message: response.data.message,
        title: '<i class="glyphicon glyphicon-remove"></i> Signin Error!',
        delay: 6000
      });
    }

    $scope.pay = function (e) {
      var handler = $window.StripeCheckout.configure({
        key: 'pk_test_2V8cJyxlQYaXSfb6dixNcZPJ',
        image: 'https://stripe.com/img/documentation/checkout/marketplace.png',
        locale: 'auto',
        token: function (token) {
          // You can access the token ID with `token.id`.
          // Get the token ID to your server-side code for use.
          UsersService.subscribeUser(token)
            .then(onUserSigninSuccess)
            .catch(onUserSigninError);
        }
      });
      // Open Checkout with further options:
      handler.open({
        name: 'Test Widget',
        description: 'Test Description',
        panelLabel: 'Subscribe',
        allowRememberMe: 'false',
        email: vm.authentication.user.email
      });
      e.preventDefault();
    };
  }
}());
