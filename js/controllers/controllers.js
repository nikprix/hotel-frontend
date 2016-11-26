angular.module('HotelAdmin.controllers', [])
    .controller('AllReservationsController', function ($scope, $state, popupService, $window, Room, AuthService,
                                                         AUTH_EVENTS, $mdDialog, pageAuthService) {

        pageAuthService.checkPageAuth(AUTH_EVENTS, AuthService, $state, $mdDialog, $scope);

        $scope.rooms = Room.query(); // Fetches all books with GET
        //console.log($scope.books);

    })
    .controller('NewBookingController', function ($scope, $state, popupService, $window, Room, AuthService,
                                                         AUTH_EVENTS, $mdDialog, pageAuthService) {

        pageAuthService.checkPageAuth(AUTH_EVENTS, AuthService, $state, $mdDialog, $scope);

        $scope.rooms = Room.query(); // Fetches all books with GET
        //console.log($scope.books);

    })
    .controller('TodayReservationsController', function ($scope, $state, popupService, $window, Room, AuthService,
                                                AUTH_EVENTS, $mdDialog, pageAuthService) {

        pageAuthService.checkPageAuth(AUTH_EVENTS, AuthService, $state, $mdDialog, $scope);

        $scope.rooms = Room.query(); // Fetches all books with GET
        //console.log($scope.books);

    })
    .controller('RoomListController', function ($scope, $state, popupService, $window, Room, AuthService,
                                                AUTH_EVENTS, $mdDialog, pageAuthService, sharedProperties) {

        pageAuthService.checkPageAuth(AUTH_EVENTS, AuthService, $state, $mdDialog, $scope);

        $scope.rooms = Room.query(); // Fetches all rooms with GET
        console.log($scope.rooms); // print rooms array

        // Search functionality
        $scope.roomSearch = new Room();

        $scope.getAvailableRooms = function () { // Gets all available rooms for checkin/checkout/price
            $scope.rooms = $scope.roomSearch.$getAvailableRooms(function (rooms) {

                console.log(rooms.roomList);
                // adding roomList array to the shared global properties
                sharedProperties.setProperty(rooms.roomList);
                // switching to the roomSearch page
                $state.go('roomSearch');
            });
        }

    })
    .controller('RoomSearchController', function ($scope, $state, popupService, $window, Room, AuthService,
                                                AUTH_EVENTS, $mdDialog, pageAuthService, sharedProperties) {

        pageAuthService.checkPageAuth(AUTH_EVENTS, AuthService, $state, $mdDialog, $scope);

        $scope.rooms = sharedProperties.getProperty();
        console.log($scope.rooms);

        // Search functionality
        $scope.roomSearch = new Room();

        $scope.getAvailableRooms = function () { // Gets all available rooms for checkin/checkout/price
            $scope.rooms = $scope.roomSearch.$getAvailableRooms(function (rooms) {
                sharedProperties.setProperty(rooms.roomList);
                $state.go($state.current, {}, {reload: true});
            });
        }

    })
    .controller('RoomViewController', function ($scope, $state, $stateParams, Room, AuthService,
                                                AUTH_EVENTS, $mdDialog, pageAuthService) {

        pageAuthService.checkPageAuth(AUTH_EVENTS, AuthService, $state, $mdDialog, $scope);

        $scope.room = Room.get({ // Gets single room with GET call
            param: $stateParams.roomNumber
        });

    })
    .controller('RoomCreateController', function ($scope, $state, $stateParams, Room, AuthService,
                                                  AUTH_EVENTS, $mdDialog, pageAuthService) {

        pageAuthService.checkPageAuth(AUTH_EVENTS, AuthService, $state, $mdDialog, $scope);

        $scope.removalStatus = {
            choices: [{
                text: "False",
                selected: "false"
            }, {
                text: "True",
                selected: "true"
            }]
        };

        $scope.room = new Room(); // Creates new room object where properties will be set via ng-model in UI

        $scope.addRoom = function () { // Creates a new room. Issues a POST request to API
            $scope.room.$save(function () {
                $state.go('rooms'); // on success goes back to the 'rooms' view
            });
        }

    })
    .controller('RoomEditController', function ($scope, $state, $stateParams, Room, AuthService,
                                                AUTH_EVENTS, $mdDialog, pageAuthService) {

        pageAuthService.checkPageAuth(AUTH_EVENTS, AuthService, $state, $mdDialog, $scope);

        $scope.updateRoom = function () { // Updates edited room with PUT request to API call
            $scope.room.$update(function () {
                $state.go('rooms'); // on success goes back to the 'books' view
            });
        };

        $scope.loadRoom = function () { // Sends a GET request to to get a room for update
            $scope.room = Room.get({
                    param: $stateParams.roomNumber
                }
                //,
                //// init form UI function: converts received String dates to the Date object
                //function () {
                //    $scope.book.dateofentry = new Date($scope.book.dateofentry);
                //    // fixing Angular's Datepicker 1 day offset issue
                //    $scope.book.dateofentry.setMinutes(
                //        $scope.book.dateofentry.getMinutes() + $scope.book.dateofentry.getTimezoneOffset());
                //
                //    $scope.book.dateofpublication = new Date($scope.book.dateofpublication);
                //    // fixing Angular's Datepicker 1 day offset issue
                //    $scope.book.dateofpublication.setMinutes(
                //        $scope.book.dateofpublication.getMinutes() + $scope.book.dateofpublication.getTimezoneOffset());
                //}
            );
        };

        $scope.loadRoom(); // Load a room for editing in the form


        // Used for disabling ISBN on edit
        $scope.isEdit = function (roomsLoaded) {
            return (roomsLoaded) ? true : false;
        };

        $scope.removalStatus = {
            choices: [{
                text: "False",
                selected: "false"
            }, {
                text: "True",
                selected: "true"
            }]
        };

    })
    .controller('HotelLoginController', AuthController);

    function AuthController($auth, $scope, $http, $state, $mdDialog, $rootScope, AuthService) {

        // Handling logout button's call here, since logout should be available through $scope
        $scope.logout = function(){
            console.log('logging out!');
            // calling service logout() function
            AuthService.logout();

            $state.go('login', {});
        }

    var vm = this;

    vm.login = function (form) {

        var credentials = {
            username: vm.username,
            password: vm.password
        }

        // additional $http configuration for Satellizer
        var httpConf = {
            headers: {
                'Content-Type': 'application/json'
            }
        }

        $auth.setStorageType('localStorage');

        // Use Satellizer's $auth service to login
        $auth.login(credentials, httpConf).then(function (response) {

            var token = JSON.stringify(response.data.authToken);
            token = JSON.parse(token);
            localStorage.setItem('auth_token', token);

            var expires = JSON.stringify(response.data.expires);
            expires = JSON.parse(expires);
            localStorage.setItem('auth_token_expires', expires);

            // since user received the JWT token - he is authenticated
            $rootScope.authenticated = true;

            console.log(response);

            // If login is successful, redirect to the books state
            $state.go('todayReservations', {});

        }).catch(function (response) {

            // using Angular Material dialog to display returned from server message
            $mdDialog.show(
                $mdDialog.alert()
                    .clickOutsideToClose(true)
                    .title('Error')
                    .textContent(response.data.message)
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

            console.log(response.data.message);
        });
    }
};
