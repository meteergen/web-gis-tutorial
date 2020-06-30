var baseMapLayer = new ol.layer.Tile({
    source: new ol.source.OSM()
});
var layer = new ol.layer.Tile({
  source: new ol.source.OSM()
});
var center = ol.proj.fromLonLat([32, 39]);
var view = new ol.View({
  center: center,
  zoom: 10
});
var map = new ol.Map({
    target: 'map',
    view: view,
    layers: [layer]
});

var styles = [];
styles['default'] = new ol.style.Style({
  image: new ol.style.Icon({
    anchor: [1, 1],
          anchorXUnits: 'fraction',
          anchorYUnits: 'fraction',
          scale: 1,
    src: '/images/ok.png'
  })
});

styles['pine'] = new ol.style.Style({
  image: new ol.style.Icon({
    anchor: [1, 1],
          anchorXUnits: 'fraction',
          anchorYUnits: 'fraction',
          scale: 0.5,
    src: '/images/pine4.png'
  })
});
styles['poplar'] = new ol.style.Style({
  image: new ol.style.Icon({
          anchor: [1, 1],
          anchorXUnits: 'fraction',
          anchorYUnits: 'fraction',
          scale: 1,
    src: '/images/poplar.png'
  })
});

var vectorSource = new ol.source.Vector({
        url:"/api/data",
        format: new ol.format.GeoJSON({ featureProjection: "EPSG:4326" })  
});


var stroke = new ol.style.Stroke({color: 'black', width: 2});
var fill = new ol.style.Fill({color: 'red'});


var markerVectorLayer = new ol.layer.Vector({
  source: vectorSource,
  style: function(feature, resolution){
          var type = feature.getProperties().tree_type;
          if(type == 'pine'){
            return styles['pine'];
          }else if(type == 'poplar'){
            return styles['poplar'];
            }else {
            return styles['default'];

          }
      }

  });




map.addLayer(markerVectorLayer);
var select = new ol.interaction.Select({multiple:false});
select.on('select', fnHandler);
map.addInteraction(select);
map.on("click",handleMapClick);
function handleMapClick(evt)
{
  var coord=ol.proj.transform(evt.coordinate, 'EPSG:3857', 'EPSG:4326');
  document.getElementById("Latitude").value=coord[1];
  document.getElementById("Longitude").value=coord[0];
}

function fnHandler(e)
{
    var coord = e.mapBrowserEvent.coordinate;
    let features = e.target.getFeatures();
    features.forEach( (feature) => {
        console.log(feature.getProperties().tree_type);
    
    document.getElementById("tree_type").value=feature.getProperties().tree_type;
    document.getElementById("tree_height").value=feature.getProperties().tree_height;
    
    });
    if (e.selected[0])
    {
    var coords=ol.proj.transform(e.selected[0].getGeometry().getCoordinates(), 'EPSG:3857', 'EPSG:4326');
    document.getElementById("Latitude").value=coords[1];
    document.getElementById("Longitude").value=coords[0];
    console.log(coords);
    }
}

function submit()
{
    var xhr = new XMLHttpRequest();
    xhr.open("POST", "/post", true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    var data=JSON.stringify({

        Latitude: document.getElementById('Latitude').value,
        Longitude: document.getElementById('Longitude').value,
        tree_type: document.getElementById('tree_type').value,
        tree_height: document.getElementById('tree_height').value
    });
    xhr.send(data);
    xhr.onload = function (e) {
      location.reload();
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          /*location.reload();*/
          console.log(xhr.responseText);
        } else {
          console.error(xhr.statusText);
        }
      }
    };
    xhr.onerror = function (e) {
      console.error(xhr.statusText);
    };
    
    
}
var maxHeight

queryVal = function query()
{
  var maxHeight= document.getElementById('query_value').value;
  if ( maxHeight>0) {
    var features = vectorSource.getFeatures();
    var i;
    for (i = 0; i < features.length; i++) {
      if ( features[i].values_.tree_height < maxHeight ) {
        var queryList = [];
        features[i].setStyle(new ol.style.Style({
          image: new ol.style.Circle({
            fill: new ol.style.Fill({
              color: 'rgba(255,255,0,1.0)'
          }),
          stroke: stroke,
            radius: 10
          })

        }))
        queryList.push(features[i]);
      }

    }
    return queryList;
  }else{
    var features = vectorSource.getFeatures();
    var i;
    for (i = 0; i < features.length; i++) {
      features[i].setStyle(null)
    }
  }
  
    
}

var qstr = function query_str()
{
  var treeType= document.getElementById('tree_type').value;
  if ( treeType != 'undefined') {
    var features = vectorSource.getFeatures();
    var i;
    for (i = 0; i < features.length; i++) {
  
      if ( features[i].values_.tree_type === treeType ) {
        
        features[i].setStyle(new ol.style.Style({
          image: new ol.style.Circle({
            fill: new ol.style.Fill({
              color: 'rgba(255,255,0,1.0)'
          }),
            stroke: stroke,
            radius: 10
          })

        }))
      }else{
        features[i].setStyle(null)
      }

    }
  }
    
}

function reset()
{
  var features = vectorSource.getFeatures();
  var i;
  for (i = 0; i < features.length; i++) {      
      features[i].setStyle(null)
  }    
}

