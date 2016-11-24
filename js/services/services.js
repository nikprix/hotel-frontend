angular.module('HotelAdmin.services', ['HotelAdmin.config'])

    .factory('Room', function ($resource, SERVICE_CONFIG_DEV, AUTH_EVENTS) {

        var token = window.localStorage.getItem(AUTH_EVENTS.LOCAL_TOKEN_KEY);

        return $resource(SERVICE_CONFIG_DEV.RESOURCE_URL, {},
            {
                query: {
                    method: 'GET',
                    transformResponse: function (data) {
                        return angular.fromJson(data).roomList;
                    },
                    isArray: true,
                    headers: {'Authorization': 'Bearer ' + token}
                },
                get: {
                    method: 'GET',
                    headers: {'Authorization': 'Bearer ' + token}
                },
                update: {
                    method: 'PUT', // this method issues a PUT request,
                    params: {param: 'update'},
                    headers: {
                        'Content-Type': 'application/json; charset=utf-8',
                        'Authorization': 'Bearer ' + token
                    }
                },
                save: {
                    method: 'POST',
                    params: {param: 'create'},
                    headers: {
                        'Content-Type': 'application/json; charset=utf-8',
                        'Authorization': 'Bearer ' + token
                    }
                }
            });
    })
    .service('popupService', function ($window) {
        this.showPopup = function (message) {
            return $window.confirm(message);
        }
    })
    // helper https://devdactic.com/user-auth-angularjs-ionic/
    .service('AuthService', function ($q, $http, $rootScope, AUTH_EVENTS, $timeout, $state) {
        var authToken;

        function useJWT() {
            var token = window.localStorage.getItem(AUTH_EVENTS.LOCAL_TOKEN_KEY);

            if (!token) {
                // this two just in case if timeout fails
                logout();
                $state.go('login');

                // timeout to wait for 'pageAuthService'
                $timeout(function(){
                    $rootScope.$broadcast(AUTH_EVENTS.notAuthenticated);
                }, 10);
            }
        }

        // NO LONGER NEEDED as sending Auth header with each request returns error 400 Bad Request from Amazon
        //function setJWTinHeaders(token) {
        //    authToken = token;
        //
        //    // Set the token as header for your requests!
        //    $http.defaults.headers.common['Authorization'] = 'Bearer ' + token;
        //}

        function destroyUserCredentials() {
            authToken = undefined;

            $rootScope.authenticated = false;
            $http.defaults.headers.common['Authorization'] = undefined;
            window.localStorage.removeItem(AUTH_EVENTS.LOCAL_TOKEN_KEY);
            window.localStorage.removeItem(AUTH_EVENTS.LOCAL_TOKEN_EXPIRATION);
        }

        var sendAuthToken = function () {
            useJWT();
        };

        var logout = function () {
            destroyUserCredentials();
        };

        var isAuthorized = function () {
            return ($rootScope.authenticated);
        };

        useJWT();

        return {
            logout: logout,
            isAuthorized: isAuthorized,
            isAuthenticated: function () {
                return $rootScope.authenticated;
            },
            sendAuthToken: sendAuthToken
        };
    })
    .factory('AuthInterceptor', function ($rootScope, $q, AUTH_EVENTS) {
        return {
            responseError: function (response) {
                $rootScope.$broadcast({
                    401: AUTH_EVENTS.notAuthenticated
                }[response.status], response);
                return $q.reject(response);
            }
        };
    })
    .factory('pageAuthService', function () {
        return {
            checkPageAuth: function (AUTH_EVENTS, AuthService, $state, $mdDialog, $scope) {

                AuthService.sendAuthToken();

                $scope.$on(AUTH_EVENTS.notAuthenticated, function(event) {
                    AuthService.logout();
                    $state.go('login');

                    // using Angular Material dialog to display message
                    $mdDialog.show(
                        $mdDialog.alert()
                            .clickOutsideToClose(true)
                            .title('Session Lost!')
                            .textContent('Sorry, You have to login again.')
                            .ok('Close')
                            // Or you can specify the rect to do the transition from
                            .openFrom({
                                top: 100,
                                width: 30,
                                height: 80
                            })
                            .closeTo({
                                left: 1500
                            })
                    );

                });
            }
        };
    })

    .config(function ($httpProvider) {
        $httpProvider.interceptors.push('AuthInterceptor');
    });
