var config_module = angular.module('HotelAdmin.config', []);

var config_data = {
    'GENERAL_CONFIG': {
        'APP_NAME': 'HotelAdmin',
        'APP_VERSION': '0.1'
    },
    'SERVICE_CONFIG': {
        'AUTH_URL': 'http://ec2-54-174-192-247.compute-1.amazonaws.com:8080/hotel-backend/webresources/authentication',
        'RESOURCE_URL': 'http://ec2-54-174-192-247.compute-1.amazonaws.com:8080/hotel-backend/webresources/rooms/:param',
        'RESERVATION_RESOURCE_URL': 'http://ec2-54-174-192-247.compute-1.amazonaws.com:8080/hotel-backend/webresources/reservations/:param',
        'CUSTOMER_RESOURCE_URL': 'http://ec2-54-174-192-247.compute-1.amazonaws.com:8080/hotel-backend/webresources/customers/:param',
        'PAYMENT_RESOURCE_URL': 'http://ec2-54-174-192-247.compute-1.amazonaws.com:8080/hotel-backend/webresources/payments/:param'
    },
    'SERVICE_CONFIG_DEV': {
        'AUTH_URL': 'http://localhost:8080/hotel-backend/webresources/authentication',
        'RESOURCE_URL': 'http://localhost:8080/hotel-backend/webresources/rooms/:param',
        'RESERVATION_RESOURCE_URL': 'http://localhost:8080/hotel-backend/webresources/reservations/:param',
        'CUSTOMER_RESOURCE_URL': 'http://localhost:8080/hotel-backend/webresources/customers/:param',
        'PAYMENT_RESOURCE_URL': 'http://localhost:8080/hotel-backend/webresources/payments/:param'
    }
};

angular.forEach(config_data,function(key,value) {
    config_module.constant(value,key)
    });