import { useRef, useEffect } from 'react';
import { loadModules } from 'esri-loader';
import FeatureLayer from "@arcgis/core/layers/FeatureLayer";
import PopupTemplate from '@arcgis/core/PopupTemplate';

// Comments
// I am not sure why the Map is duplicating itself many times on the page, was not able to resolve due to time constraint

function MainMap() {

    const mapRef = useRef(null);

    useEffect(() => {
        // Load Map for the first time
        loadModules(['esri/Map', 'esri/views/MapView', 'esri/widgets/Sketch', 'esri/Graphic', 'esri/layers/GraphicsLayer'])
        .then(([ArcGISMap, MapView, Sketch, Graphic, GraphicsLayer]) => {
            const trailsLayer = new FeatureLayer({
                url: 'https://services3.arcgis.com/GVgbJbqm8hXASVYi/arcgis/rest/services/Trails/FeatureServer/0'
            });

            const parksLayer = new FeatureLayer({
                url: 'https://services3.arcgis.com/GVgbJbqm8hXASVYi/arcgis/rest/services/Parks_and_Open_Space/FeatureServer/0',
                outFields: ['acres', 'name', 'area'],
                popupTemplate: new PopupTemplate({
                    title: '{name}',
                    content: [
                    {
                        type: 'text',
                        text: 'Acres: {acres}\nName: {name}\nArea: {area}'
                    }
                    ]
                })
            })

            // map and view variables to render the Map
            const map = new ArcGISMap({
                basemap: 'topo-vector',
                layers: [trailsLayer, parksLayer]
            });

            const view = new MapView({
                container: mapRef.current, map,
                center: [-118, 34],
                zoom: 8
            });

            const graphicsLayer = new GraphicsLayer();
            map.add(graphicsLayer);

            const sketch = new Sketch({
                view: view,
                layer: graphicsLayer,
                creationMode: 'update'
            });

            view.ui.add(sketch, 'top-right');

            // Point Widget
            sketch.on('create', (event) => {
                if (event.state === 'complete') {
                    const point = new Graphic({
                    geometry: event.graphic.geometry,
                    symbol: {
                        type: 'simple-marker',
                        color: 'white',
                        size: '8px'
                    }
                    });
                    graphicsLayer.add(point);
                }

                // Line Widget
                if (event.state === 'complete' && event.tool === 'polyline') {
                    const line = new Graphic({
                        geometry: event.graphic.geometry,
                        symbol: {
                        type: 'simple-line',
                        color: 'gray',
                        width: '2px',
                        style: 'solid'
                        }
                    });
                    graphicsLayer.add(line);
                }
                

                // Polygon Widget
                if (event.state === 'complete' && event.tool === 'polygon') {
                    const polygon = new Graphic({
                        geometry: event.graphic.geometry,
                        symbol: {
                        type: 'simple-fill',
                        color: [0, 0, 0, 0.5], 
                        outline: {
                            color: [255, 0, 0],
                            width: 1,
                            style: 'solid'
                        }
                        }
                    });
                    graphicsLayer.add(polygon);
                }
            });


        });

    }, [])
    
    return <div style={{ width: '100%', height: '400px' }} ref={mapRef} />;
}

export default MainMap;