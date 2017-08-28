import { Component, ViewChild, Input, ElementRef, AfterViewInit } from '@angular/core';

declare var google: any;


@Component({
    selector: 'app-google-map',
	templateUrl: 'googlemaps.html',
	styleUrls: ['googlemaps.css']
})
export class GoogleMapsComponent {
    @ViewChild('map') mapElement: ElementRef;

    // MAP CONFIG
    @Input() zoom: number = 14;
    @Input('lat') latitude: number = -28.468452;
    @Input('lng') longitude: number = -65.779094;
    @Input('height_map') public height_map;

    map: any;
    layers: any[] = [];
    polyline: any;
    myPositionMarker: any;
    originRouteLatLng: any;
    destRouteLatLng: any;
    destRouteLatLngGlobal: any;
    infowindow: any;

    // ESTILOS
    mapPopupBtnGroupStyle = "margin-top: 10px !important;text-align: center !important;";
    mapPopupBtnStyle = "border: 1px solid rgba(25, 27, 17, 0.29) !important;margin-right: 5px !important;padding: 10px !important;cursor: pointer !important;color: #FFF !important;background: #009bff;text-shadow: 1px 1px grey;";

    constructor() {}

    ngAfterViewInit() {
       // this.resizeMap();
    }

    initMap() {
        let mapEle = this.mapElement.nativeElement;
        let latLng = new google.maps.LatLng(this.latitude, this.longitude);

        this.map = new google.maps.Map(mapEle, {
            center: latLng,
            zoom: this.zoom
        });

        google.maps.event.addListenerOnce(this.map, 'idle', () => {
            mapEle.classList.add('show-map');
        });

        this.infowindow = new google.maps.InfoWindow();

        this.map.addListener('click', () => {
           this.closeInfoWindow();
        });

        this.resizeMap();
    }

    resizeMap(): void {
        google.maps.event.trigger(this.map, 'resize');
    }

    setCenter(latitude: number = this.latitude, longitude: number = this.longitude): void {
        let latLng = new google.maps.LatLng(latitude, longitude);
        this.map.setCenter(latLng);
    }

    setBounds(layer: any, route:boolean=false): void {
        let bounds = new google.maps.LatLngBounds();
        if(route){
            bounds.extend(this.originRouteLatLng);
            bounds.extend(this.destRouteLatLng);
        }else{
            this.layers[layer].forEach(feature => {
                feature.getGeometry().forEachLatLng(latlng => {
                    bounds.extend(latlng);
                })
            });
        }

        this.map.fitBounds(bounds);
    }

    prepareRoute(layer: string, latLng?: any){
        if(latLng){
            this.destRouteLatLng = new google.maps.LatLng(latLng[0], latLng[1]);;
        }
        //this.coreService.presentLoading('Cargando Ruta...');
        if(this.myPositionMarker){
            //this.coreService.dismissLoading();
            //this.originRouteLatLng = this.myPositionMarker.position;
            //this.setRoute(this.originRouteLatLng, this.destRouteLatLng);          
        }else{
            //this.coreService.dismissLoading();
            //this.coreService.showAlert('Falta Origen', 'Cargue su posición de origen y vuelva a intentar.');
        }
    }

    setRoute(origin: any, destination:any){
        if (this.polyline){
            this.polyline.setMap(null);
        }
        //Initialize the Path Array
        var path = new google.maps.MVCArray();
        //Initialize the Direction Service
        var service = new google.maps.DirectionsService();
        //Set the Path Stroke Color
        this.polyline = new google.maps.Polyline({ 
            strokeColor: '#4986E7',
            strokeOpacity: 1.0,
            strokeWeight: 3
        });
        this.polyline.setMap(this.map);
        var lat_lng = new Array();
        lat_lng.push(origin);
        lat_lng.push(destination);
        //Loop and Draw Path Route between the Points on MAP
        for (var i = 0; i < lat_lng.length; i++) {
            if ((i + 1) < lat_lng.length) {
                var src = lat_lng[i];
                var des = lat_lng[i + 1];
                path.push(src);
                this.polyline.setPath(path);
                service.route({
                    origin: src,
                    destination: des,
                    travelMode: google.maps.DirectionsTravelMode.DRIVING
                }, function (result: any, status: any) {
                    if (status == google.maps.DirectionsStatus.OK) {
                        for (var i = 0, len = result.routes[0].overview_path.length; i < len; i++) {
                            path.push(result.routes[0].overview_path[i]);
                        }
                    }
                });
            }
        }
        this.setBounds(this.polyline, true);
    }

    removeRoute(){
        if (this.polyline){
            this.polyline.setMap(null);
        }
    }

    setMarkerOnClick(layer:string){
         this.layers[layer].addListener('click', (event: any) => {
            let json = JSON.stringify(event.feature.f);
            let latLong: any;
            event.feature.getGeometry().forEachLatLng((latlng: any) => {
                latLong = JSON.stringify([latlng.lat(), latlng.lng()]);
            });
            let div = 
            "<div class='reclamo-popup' data-reclamo='"+ json +"' data-ruta='"+ latLong +"' data-layer='"+ layer +"'>" +
                "<div clas='reclamo-popup-group'>" +
                    "<button class='reclamo-popup-btn btn-pop-reclamo-detalle'>Detalle</button><button class='reclamo-popup-btn btn-pop-reclamo-ruta'>Ruta</button>"+
                "</div>"+
            "</div>";
            this.infowindow.setContent("<div style='width:150px; text-align: center;'>"+ div +"</div>");
            this.infowindow.setPosition(event.feature.getGeometry().get());
            this.infowindow.setOptions({pixelOffset: new google.maps.Size(0,-30)});
            this.infowindow.open(this.map);
        });
    }

    closeInfoWindow(){
        this.infowindow.close();
    }

    setHeightMap(height: number): void {
        this.height_map = height;
    }

    createLayer(layer: string){
        this.layers[layer] = new google.maps.Data();
        this.layers[layer].setMap(this.map);
    }

    hiddenLayer(layer?: string) {
        if (layer){
            this.layers[layer].setMap(null);
        }else{
            // eliminar todos
        }
        
    }

    addGeoJson(layer: string, json: any){
        this.layers[layer].addGeoJson(json);
    }

    addOnClick(layer: string){
        this.layers[layer].addListener('click', event => {
            // TODO ON CLICK
        });  
    }

    addFeature(layer: string, json: any) {
        this.layers[layer].addFeature(json);
    }

    removeFeatureByPk(layer: string, feature: any) {
        this.layers[layer].forEach((f: any) => {
            if(f.getProperty('pk') == feature.properties.pk){
                this.layers[layer].remove(f);
            }
        });
    }

    setIcons(layer: string, icon: any){
        this.layers[layer].setStyle(feature => {
			if(icon){
				return {icon: icon};
			}else{
				return feature.getProperty('icon');
			}       
        });
    }

    setLabel(layer: string, params: any){
        let labelText: string;
        function getProperty(feature: any){
            let i = 0;
            params.forEach(property => {
                if(i >= 1){
                    labelText = labelText[property];
                }else{
                    labelText = feature.getProperty(property);
                }
                i = i + 1;
            });
        }
        
        this.layers[layer].setStyle(feature => {
            getProperty(feature);
            return /** @type {google.maps.Data.StyleOptions} */({
                icon: {
                    url: 'assets/images/marker.png',
                    labelOrigin: new google.maps.Point(20, -10)
                },
                label: {
                    text: labelText,
                    fontFamily: "Courier",
                    fontSize: "20px",
                    fontWeight: "bold",
                },
            });
        });
    }

    myLocationSet(center?:boolean){
        // Loading modal Start
        if(center && this.myPositionMarker){
            //this.coreService.presentLoading('Cargando su ubicación...');
            this.setCenter(this.myPositionMarker.getPosition().lat(), this.myPositionMarker.getPosition().lng());
            //this.coreService.dismissLoading();
        }else{
            if(center){
				//this.coreService.presentLoading('Cargando su ubicación...')
			}
        }
    }

    myLocationWatch(){}

}
