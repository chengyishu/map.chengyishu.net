var map, mapCenter, layerData, layer, inforWindow;

$.getJSON('data.json', function (result) {
    const params = new URLSearchParams(window.location.search);
    var id = params.get('id');
    if (!id) {
        // 默认中心定位北方购物
        location.href = '/?id=bfgw';
    }
    if (result[id]) {
        $('title').text($('title').text().replace('{{name}}', result[id].name));
        mapCenter = new LKMap.LngLat(result[id].lng, result[id].lat);
        map = new LKMap.Map("map", {
            center: mapCenter,
            zoom: 14.1,
        });
        map.on('load', mapLoadFunction);
    } else {
        // 显示全部中心定位
        $('title').text($('title').text().replace('{{name}}', '全部地点'));
        $('body').css('background', 'black');
        $('body').html('<div class="json"><pre>' + JSON.stringify(result, null, 5) + '</pre></div>');
    }
});

function mapLoadFunction() {
    addOverLayer();
    $('.LK-map-logo,.LK-map-logo-right').remove();
}

function addOverLayer() {
    for (var i in layerData) {
        var itemData = layerData[i];
        switch (itemData.type) {
            case 'marker':
                layer = new LKMap.Marker({
                    map: map,
                    position: new LKMap.LngLat(itemData.lnglat.lng, itemData.lnglat.lat),
                    anchor: 'bottom',
                    extData: itemData,
                    cursor: 'pointer',
                });
                break;
            case 'polyline':
                layer = new LKMap.Polyline({
                    map: map,
                    path: itemData.path,
                    strokeWeight: itemData.strokeWeight,
                    strokeColor: itemData.strokeColor,
                    strokeOpacity: itemData.strokeOpacity,
                    extData: itemData,
                    cursor: 'pointer',
                });
                break;
            case 'polygon':
                layer = new LKMap.Polygon({
                    map: map,
                    path: itemData.path,
                    fillColor: itemData.fillColor,
                    fillOpacity: itemData.fillOpacity,
                    strokeWeight: itemData.strokeWeight,
                    strokeColor: itemData.strokeColor,
                    strokeOpacity: itemData.strokeOpacity,
                    extData: itemData,
                    cursor: 'pointer',
                });
                break;
        }
        if (layer) layer.on('click', clickLayerCallback)
    }
}

function clickLayerCallback(e) {
    var extData = e.layer.getExtData()
    if (!inforWindow) createInforWindow();
    if (e.layer.type == 'marker') {
        inforWindow.options['offset'] = [0, -33];
        inforWindow.setHTML('<h3>' + extData.name + '</h3><p>' + extData.intro + '</p>');
        inforWindow.open(map, e.layer.getPosition());
    } else {
        inforWindow.options['offset'] = [0, 0];
        inforWindow.setHTML('<h3>' + extData.name + '</h3><p>' + extData.intro + '</p>');
        inforWindow.open(map, e.lngLat);
    }
}

function createInforWindow() {
    inforWindow && inforWindow.close();
    inforWindow = new LKMap.InforWindow({
        anchor: 'bottom',
        closeOnClick: true,
        autoMove: true,
        content: ''
    });

}