import React from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./StoreLocationMap.css";

// 修正預設圖標問題
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const StoreLocationMap = ({ storeLocations }) => {
   if (!storeLocations || !Array.isArray(storeLocations)) return null;
  const validLocations = storeLocations.filter(
    (store) => store.latitude && store.longitude
  );

  const center = validLocations.length
    ? [validLocations[0].latitude, validLocations[0].longitude]
    : [25.04, 121.56];

  return (
    <div className="map-wrapper">
      <MapContainer center={center} zoom={12} scrollWheelZoom={false}>
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {validLocations.map((store, index) => (
          <Marker
            key={index}
            position={[store.latitude, store.longitude]}
          >
            <Popup>
              <b>{store.store_name}</b><br />
              {store.address}<br />
              當月營收：{store.revenue} 元
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default StoreLocationMap;