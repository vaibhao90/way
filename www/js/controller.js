var map;
 var directionsDisplay = new google.maps.DirectionsRenderer;
 var start;
        var directionsService = new google.maps.DirectionsService;
angular.module('starter.controllers', ['ionic', 'firebase'])
    .controller('MapCtrl', ['$scope', '$firebase', '$ionicPopup', function($scope, $firebase, $ionicPopup) {

        var firebaseObj = new Firebase("https://way-where-are-yo-1488827084117.firebaseio.com/MapDetails");
        // var firebaseObj = new Firebase("https://blistering-heat-2473.firebaseio.com/MapDetails");
        var fb = $firebase(firebaseObj);

        $scope.user = {};

        console.log("Firebase0", fb);
        $scope.saveDetails = function() {
            var lat = $scope.user.latitude;
            var lgt = $scope.user.longitude;
            var des = $scope.user.desc;
            fb.$push($scope.user).then(function(ref) {
                $scope.user = {};
                $scope.showAlert();
            }, function(error) {
                console.log("Error:", error);
            });
        }

        // Code will be here
        $scope.showAlert = function() {
            $ionicPopup.alert({
                title: 'WAY',
                template: 'Your location has been saved!!'
            });
        };

        $scope.positions  = fb.$asArray();
        console.log("$scope.positions", $scope.positions);

     //    // to take an action after the data loads, use the $loaded() promise
     // fb.$loaded().then(function() {
     //   // To iterate the key/value pairs of the object, use angular.forEach()
     //   angular.forEach(fb, function(value, key) {
     //      console.log("key, value", key, value);
     //   });
     // });


        $scope.$watchCollection("positions", function(newVal, oldVal){
            console.log("autocomplete", newVal, oldVal);
            if(newVal && newVal.length){
                for (var i = 0; i < newVal.length; i++) {
                    console.log("newVal11", newVal[i]);
                    var value =  newVal[i];
                     var lat = value.latitude;
                     var lgt = value.longitude;
                      var myLatlng = new google.maps.LatLng(lat, lgt);
                     var marker = new google.maps.Marker({
                      position: myLatlng,
                      map: map,
                      title: 'Hello World!'
                    });
                     if(i!=0){
                        var start =  new google.maps.LatLng(newVal[0].latitude, newVal[0].longitude);
                         calculateAndDisplayRoute(directionsService, directionsDisplay, start, myLatlng);
                    }
                };
                // newVal.forEach(newVal, function(value, key){
                //     console.log("newVal", value, key);
          
                // })
            }else{

            }
        })


        function calculateAndDisplayRoute(directionsService, directionsDisplay, start, end) {
      
        directionsService.route({
          origin: start,
          destination: end,
          travelMode: 'WALKING'
        }, function(response, status) {
          if (status === 'OK') {
            directionsDisplay.setDirections(response);
          } else {
            window.alert('Directions request failed due to ' + status);
          }
        });
      }


    }])

.directive('map', function() {
    return {
        restrict: 'A',
        // scope: {
        //     autocomplete: "="
        // },
        link: function(scope, element, attrs) {

            var zValue = scope.$eval(attrs.zoom);
            var lat = scope.$eval(attrs.lat);
            var lng = scope.$eval(attrs.lng);


            var myLatlng = new google.maps.LatLng(lat, lng),
                mapOptions = {
                    zoom: zValue,
                    center: myLatlng
                };

                map = new google.maps.Map(element[0], mapOptions);

                 directionsDisplay.setMap(map);
        directionsDisplay.setPanel(document.getElementById('right-panel'));
            var marker = new google.maps.Marker({
                    position: myLatlng,
                    map: map,
                    draggable: true
                });

            google.maps.event.addListener(marker, 'dragend', function(evt) {
                console.log("Eventsdkldfnmvl", evt);
                scope.$parent.user.latitude = evt.latLng.lat();
                scope.$parent.user.longitude = evt.latLng.lng();
                var latlng = new google.maps.LatLng(evt.latLng.lat(), evt.latLng.lng())
                var geocoder = new google.maps.Geocoder;
                geocoder.geocode({'location': latlng}, function(results, status) {
                    if (status === 'OK' && results[1]) {
                       scope.$parent.user.address = results[1].formatted_address
                    }
                                    if(scope.$root.$$phase!='$apply'&&scope.$root.$$phase!='$digest')scope.$apply();

                })
                if(scope.$root.$$phase!='$apply'&&scope.$root.$$phase!='$digest')scope.$apply();
                    
            });

            // scope.$watch("autocomplete", function(newVal, oldVal){
            //     console.log("autocomplete", newVal, oldVal);
            //     if(newVal){
            //        var autocomplete = new google.maps.places.Autocomplete(input);

            //     }else{

            //     }
            // })
        }
    };
})


.directive('autocompleteField', function() {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            //          var autocomplete = new google.maps.places.Autocomplete(element);
            console.log("element", map);
            // element.on("focus", function(evt) {
            // console.log("evt", evt);
            var autocomplete;

      
            function fillInAddress() {
                // Get the place details from the autocomplete object.
                var place = autocomplete.getPlace();
                if (place.geometry) {
                    map.panTo(place.geometry.location);
                    var myLatlng = new google.maps.LatLng(place.geometry.location.lat(), place.geometry.location.lng());
                     var marker = new google.maps.Marker({
                                        position: myLatlng,
                                        map: map,
                                        draggable: true
                                    });
                    console.log("Marker", place.geometry.location.lat());
                    map.setZoom(15);
                    // search();
                } else {
                    document.getElementById('autocomplete').placeholder = 'Enter a city';
                }
            }

            autocomplete = new google.maps.places.Autocomplete((document.getElementById(attrs.id)), { types: ['geocode'] });
            // places = new google.maps.places.PlacesService(map);

            autocomplete.addListener('place_changed', fillInAddress);


            // When the user selects an address from the dropdown, populate the address
            // fields in the form.
            // autocomplete.addListener('place_changed', fillInAddress);
            navigator.geolocation.getCurrentPosition(function(position) {
                var geolocation = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
                var circle = new google.maps.Circle({
                    center: geolocation,
                    radius: position.coords.accuracy
                });
                autocomplete.setBounds(circle.getBounds());
            });
            //})
        }
    }
});
