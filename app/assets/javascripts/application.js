
$(function(){
    var map, infoWindow;
    var imageMap = {
        "Conflict": "/assets/conflict.png",
        "Depredation": "/assets/depredation.png",
        "Meeting Point": "/assets/meetingPoint.png",
        "Police": "/assets/policeLine.png",
    };
    function setupMap() {
      if (navigator.geolocation) {
          map = navigator.geolocation.getCurrentPosition(initialize);
        } else {
          alert("Geolocation not available");
        }
      }   

    function initialize(position) {
        var mapOptions = {
            center: new google.maps.LatLng(position.coords.latitude,  position.coords.longitude),
            zoom: 15,
            mapTypeId: google.maps.MapTypeId.ROADMAP
        };
        map = new google.maps.Map(document.getElementById("map-canvas"), mapOptions);
        infoWindow = new google.maps.InfoWindow();
        load_markers();
    }
    
    function add_marker_to_map(point){
        var marker = new google.maps.Marker({ position: new google.maps.LatLng(point.latitude,  point.longitude), map: map, icon: imageMap[point.marker_type]}),
            infoWindow,
            content = "<b>"+ point.marker_type +"</b><br/>" + point.description;
        infoWindow = new google.maps.InfoWindow({
            content: content
        });
        google.maps.event.addListener(marker, 'click', function() {
          infoWindow.open(map,marker);
        });
    }
    
    function load_markers () {
        $.getJSON("/markers.json", function(data){
            $.each(data, function(){
                add_marker_to_map(this);
            });
        });
    }
    
    google.maps.event.addDomListener(window, 'load', setupMap);
    
    var marker_types = $("#marker-types");
    
    $("#add-marker").on('click', function(){
        marker_types.removeClass('hide');
    });
    
    marker_types.find("a").on("click", function(){
        var params = {}, element = $(this);
        params['marker_type'] = element.attr("data-name");
        marker_types.addClass('hide');
        if (params['marker_type']=="Cancel"){
            return false;
        }
        var listenerHandle = google.maps.event.addListener(map, 'click', function(event) {
            params['longitude'] = event.latLng.lng();
            params['latitude'] = event.latLng.lat();
            params['description'] = prompt("Describe") || "";
            $.post("/markers.json", {marker: params}, function(data){
                add_marker_to_map(params);
                google.maps.event.removeListener(listenerHandle);
            });
        });
    });
    
   window.setTimeout(load_markers, 60000);
});
