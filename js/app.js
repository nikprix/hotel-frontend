var hotelAdmin = angular.module('HotelAdmin',
    ['ui.router', 'ngResource', 'HotelAdmin.controllers', 'HotelAdmin.services', 'ngMessages', 'satellizer',
        'ngMaterial', 'HotelAdmin.config'])
    .constant('AUTH_EVENTS', {
        notAuthenticated: 'auth-not-authenticated',
        LOCAL_TOKEN_KEY: 'auth_token',
        LOCAL_TOKEN_EXPIRATION: 'auth_token_expires'
    });

hotelAdmin.config(function ($stateProvider, $httpProvider, $urlRouterProvider, $authProvider, SERVICE_CONFIG_DEV) {

    // Solution to avoid CORS on client side:  Reset headers to avoid OPTIONS request (preflight)
    $httpProvider.defaults.headers.common = {};
    $httpProvider.defaults.headers.patch = {};
    $httpProvider.defaults.headers.post = {};
    $httpProvider.defaults.headers.put = {};

    // Satellizer configuration that specifies which API
    // route the JWT should be retrieved from
    $authProvider.loginUrl = SERVICE_CONFIG_DEV.AUTH_URL;

    // Redirect to the auth state if any other states
    // are requested other than users
    $urlRouterProvider.otherwise('/login');

    $stateProvider
        .state('login', {
            url: '/login',
            templateUrl: 'partials/hotel-login.html',
            controller: 'HotelLoginController as auth'
        }).state('rooms', {
            url: '/rooms',
            templateUrl: 'partials/rooms.html',
            controller: 'RoomListController'
        }).state('viewRoom', {
        url: '/rooms/:roomNumber/view',
        templateUrl: 'partials/room-view.html',
        controller: 'RoomViewController'
    }).state('newRoom', {
        url: '/rooms/new',
        templateUrl: 'partials/room-add.html',
        controller: 'RoomCreateController'
    }).state('editRoom', {
        url: '/rooms/:roomNumber/edit',
        templateUrl: 'partials/room-edit.html',
        controller: 'RoomEditController'
    }).state('roomSearch', {
        url: '/roomSearch',
        templateUrl: 'partials/search-rooms.html',
        controller: 'RoomSearchController'
    }).state('viewReservation', {
        url: '/reservations/:reservationId/view',
        templateUrl: 'partials/reservation-view.html',
        controller: 'ReservationViewController'
    }).state('todayReservations', {
        url: '/todayReservations',
        templateUrl: 'partials/today-reservations.html',
        controller: 'TodayReservationsController'
    }).state('allReservations', {
        url: '/allReservations',
        templateUrl: 'partials/reservations.html',
        controller: 'AllReservationsController'
    }).state('reservationSearch', {
        url: '/reservationSearch',
        templateUrl: 'partials/search-reservations.html',
        controller: 'ReservationSearchController'
    }).state('newBooking', {
        url: '/newBooking',
        templateUrl: 'partials/newbooking.html',
        controller: 'NewBookingController'
    });
}).run(function ($rootScope, $state, AuthService, AUTH_EVENTS) {

    $rootScope.authenticated;

    var token = window.localStorage.getItem(AUTH_EVENTS.LOCAL_TOKEN_KEY);
    if (token) {
        $rootScope.authenticated = true;
    } else {
        $rootScope.authenticated = false;
    }

    $rootScope.$on('$stateChangeStart', function (event, next, nextParams, fromState) {

        console.log('Authenticated: ' + AuthService.isAuthenticated());

        if (!AuthService.isAuthenticated()) {

            if (next.name !== 'login') {
                event.preventDefault();
                $state.go('login');
            }
        }
    });
});

