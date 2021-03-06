angular.module('HotelAdmin.controllers', [])
    .controller('AllReservationsController',
        function ($scope, $state, popupService, $window, Room, AuthService, Reservation,
                  AUTH_EVENTS, $mdDialog, pageAuthService, sharedPropertiesReservation) {

            pageAuthService.checkPageAuth(AUTH_EVENTS, AuthService, $state, $mdDialog, $scope);

            $scope.reservations = Reservation.query(); // Fetches all Reservations with GET
            console.log($scope.reservations);


            // Search functionality
            $scope.reservationSearch = new Reservation();

            $scope.getAvailableReservations = function () { // Gets all available reservation for checkin
                $scope.reservations = $scope.reservationSearch.$getSearchReservations(function (reservations) {

                    console.log(reservations.todayReservationList);
                    // adding todayReservationList array to the shared global properties
                    sharedPropertiesReservation.setProperty(reservations.todayReservationList);
                    // switching to the roomSearch page
                    $state.go('reservationSearch');
                });
            }
        })
    .controller('ReservationSearchController',
        function ($scope, $state, popupService, $window, Room, AuthService, Reservation,
                  AUTH_EVENTS, $mdDialog, pageAuthService, sharedPropertiesReservation) {

            pageAuthService.checkPageAuth(AUTH_EVENTS, AuthService, $state, $mdDialog, $scope);

            $scope.reservations = sharedPropertiesReservation.getProperty();

            // Search functionality
            $scope.reservationSearch = new Reservation();

            $scope.getAvailableReservations = function () { // Gets all available reservation for checkin
                $scope.reservations = $scope.reservationSearch.$getSearchReservations(function (reservations) {
                    sharedPropertiesReservation.setProperty(reservations.todayReservationList);
                    $state.go($state.current, {}, {reload: true});
                });
            }

        })
    .controller('TodayReservationsController',
        function ($scope, $state, popupService, $window, Reservation, AuthService,
                  AUTH_EVENTS, $mdDialog, pageAuthService) {

            pageAuthService.checkPageAuth(AUTH_EVENTS, AuthService, $state, $mdDialog, $scope);

            // Getting current Date and in UTC
            var now = new Date();
            var now_utc = new Date(now.getUTCFullYear(), now.getUTCMonth(),
                now.getUTCDate(), now.getUTCHours(), now.getUTCMinutes(), now.getUTCSeconds());

            var currentDateForReservations = {
                currentDate: now
            };

            $scope.todayReservations = Reservation.getTodayReservations(currentDateForReservations); // Fetches all
                                                                                                     // today
                                                                                                     // Reservations
                                                                                                     // with POST
            console.log($scope.todayReservations);

        })
    .controller('ReservationViewController', function ($scope, $state, $stateParams, Reservation, Room, Customer,
                                                       Payment, AuthService, AUTH_EVENTS, $mdDialog, pageAuthService,
                                                       $q, $rootScope, $window) {

        pageAuthService.checkPageAuth(AUTH_EVENTS, AuthService, $state, $mdDialog, $scope);

        // Using $q service and its .then function to run 2 calls synchronously
        // at first - need to get Reservation object
        // and then - extract 'roomNumberId' from reservation to call
        // for room details

        $q.all([
            $scope.reservation = Reservation.get({ // Gets single reservation with GET call
                param: $stateParams.reservationId
            })
        ]).then(function (data) {

            console.log(data[0]);
            console.log(typeof(data[0]));

            data[0].$promise.then(function (data) {

                $scope.room = Room.get({ // Gets single room with GET call using roomNumberId retrieved from data
                    param: data.roomNumberId
                });

                $scope.customer = Customer.get({ // Gets single customer with GET call  using customerId retrieved from data
                    param: data.customerId
                });

                $scope.payment = Payment.get({ // Gets payment with GET call  using customerId retrieved from
                    // data
                    param: data.reservationId
                });

            });

        });

        $rootScope.$on('$stateChangeSuccess', function (event, to, toParams, from, fromParams) {
            //save the previous state in a rootScope variable so that it's accessible from everywhere
            $rootScope.previousState = from;
        });


        // Handling DELETE button's call here, since DELETE should be available through $scope
        $scope.deleteReservation = function () {
            console.log('Deleting reservation!');

            Reservation.deleteReservation({
                param: $stateParams.reservationId
            });

            //$q.all([
            //    $window.history.back()
            //]).then(function() {
            //    $state.go($state.current, {}, {reload: true});
            //});


            if (typeof $rootScope.previousState === "undefined" || $rootScope.previousState.name == 'reservationSearch') {
                $state.go('allReservations');
            } else {
                $state.go($rootScope.previousState.name);
            }

        }

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

        $scope.room = new Room(); // Creates new room object where properties will be set via ng-model in UI

        $scope.addRoom = function () { // Creates a new room. Issues a POST request to API
            $scope.room.$save(function () {
                $state.go('rooms'); // on success goes back to the 'rooms' view
            });
        }

    })
    .controller('NewBookingController', function ($scope, $state, $stateParams, Room, AuthService, Reservation,
                                                  Customer, Payment, AUTH_EVENTS, $mdDialog, pageAuthService, $q) {

        pageAuthService.checkPageAuth(AUTH_EVENTS, AuthService, $state, $mdDialog, $scope);

        $scope.cardtypes = {
            choices: [{
                text: "Visa",
                selected: "true"
            }, {
                text: "MasterCard",
                selected: "false"
            }]
        };

        // Using $q service and its .then function to run 2 calls synchronously
        // at first - need to get Reservation object
        // and then - extract 'roomNumberId' from reservation to call
        // for room details

        // creating objects to map data from the form
        $scope.customer = new Customer();
        $scope.payment = new Payment();
        $scope.reservation = new Reservation();

        // need to initialize below fields because they are mandatory for sending via API call.
        // call returns IDs of the created records.
        $scope.customer.customerId = 0;
        $scope.reservation.reservationId = 0;
        $scope.payment.paymentId = 0;
        // hardcoding employeeId for now. future enhancement - get it after login and store for
        // future retrieval either in local storage or scope.
        $scope.reservation.employeeId = 1;

        $scope.addBooking = function () { // Creates a new booking. Issues a POST request to API

            $scope.customer.$save(function (id) {
                // overwriting customerId with created id (returned by API) needed for saving of reservation/payment
                $scope.reservation.customerId = id.customerId;
                $scope.payment.customerId = id.customerId;

                // updating $scope.customer.customerId too:
                $scope.customer.customerId = id.customerId;
                console.log('created customer with ID: ' + id.customerId);


                $scope.reservation.$createReservation(function(id){
                    $scope.payment.reservationId = id.reservationId;
                    // updating $scope.reservation.reservationId too:
                    $scope.reservation.reservationId = id.reservationId;
                    console.log('created reservation with ID: ' + id.reservationId);


                    $scope.payment.$save(function (id) {
                        // overwriting paymentId with created id (returned by API)
                        $scope.payment.paymentId = id.paymentId;
                        $scope.payment.customerId = $scope.customer.customerId;
                        console.log('created payment with ID: ' + id.paymentId);

                        $state.go('allReservations');
                    });

                });

            });





            //$q.all([
            //
            //    $scope.customer.$save(function (id) {
            //        // overwriting customerId with created id (returned by API)
            //        $scope.customer.customerId = id;
            //        console.log('created customer' + $scope.customer.customerId);
            //    })
            //
            //]).then(function (data) {
            //
            //    //console.log(data[0]);
            //
            //    data[0].$promise.then(function () {
            //
            //        $q.all([
            //
            //            $scope.payment.$save(function (id) {
            //                // overwriting paymentId with created id (returned by API)
            //                $scope.payment.paymentId = id;
            //                console.log('created payment' + $scope.payment.paymentId);
            //            })
            //
            //        ]).then(function () {
            //
            //            $scope.reservation.$createReservation(function(){
            //                $state.go('allReservations');
            //            });
            //
            //        });
            //
            //    });
            //
            //});


        }


    })
    .controller('HotelLoginController', AuthController);

function AuthController($auth, $scope, $http, $state, $mdDialog, $rootScope, AuthService) {

    // Handling logout button's call here, since logout should be available through $scope
    $scope.logout = function () {
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
