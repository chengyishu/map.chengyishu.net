var map, mapCenter, layerData, layer, inforWindow;

$.getJSON('data.json', function (result) {
    const params = new URLSearchParams(window.location.search);
    if (params.has('id')) {
        // 指定ID
        var id = params.get('id');
        if (id && result[id]) {
            // 指定ID可用
            // 显示地图
            showMap(result[id].lng, result[id].lat, result[id].name);
        } else {
            // 指定ID不可用
            // 显示全部位置
            showList(result);
        }
    } else if (params.has('jw')) {
        // 指定经纬度
        jw = params.get('jw').split(',');
        if (jw.length == 2 && jw[0] && jw[1]) {
            // 显示地图
            title = '指定经度:' + jw[0] + ',指定纬度:' + jw[1];
            showMap(jw[0], jw[1], title);
        } else {
            // 显示地图
            showMap();
        }
    } else {
        // 显示地图
        showMap();
    }
});

function mapLoadFunction() {
    addOverLayer();
    // 清除标记
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
        if (layer) layer.on('click', clickLayerCallback);
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

// 显示地图
function showMap(lng, lat, title) {
    if (lng && lat && title) {
        // 显示指定位置
        $('title').text(title);
        mapCenter = new LKMap.LngLat(lng, lat);
        map = new LKMap.Map("map", {
            center: mapCenter,
            zoom: 14.1,
        });
        map.on('load', mapLoadFunction);
    } else {
        // 显示当前位置
        if(navigator.geolocation){
          navigator.geolocation.getCurrentPosition(onSuccess, onError);
        }else{
          alert("您的浏览器不支持使用 HTML 5 来获取地理位置服务。");
        }
    }
}

// 定位数据获取成功响应
function onSuccess(position){
    var lng = position.coords.longitude;
    var lat = position.coords.latitude;
    var title = '当前位置';
    layerData = [{"type":"marker","name":title,"intro":title,"lnglat":{"lng":lng,"lat":lat}}];
    showMap(lng, lat, title);
}

// 定位数据获取失败响应
function onError(error) {
  switch(error.code) {
    case error.PERMISSION_DENIED:
        alert("您拒绝对获取地理位置的请求。");
        break;
    case error.POSITION_UNAVAILABLE:
        alert("位置信息不可用。");
        break;
    case error.TIMEOUT:
        alert("请求您的地理位置超时。");
        break;
    case error.UNKNOWN_ERROR:
        alert("未知错误。请联系管理员。");
        break;
    default:
        // 跳转到默认ID:北方购物
        location.href = '/?id=bfgw';
        break;
  }
}

// 显示全部位置
function showList(data) {
    $('title').text('全部位置');
    $('body').css('background', 'black');
    $('body').html('<div class="json"><pre>' + JSON.stringify(data, null, 5) + '</pre></div>');
}