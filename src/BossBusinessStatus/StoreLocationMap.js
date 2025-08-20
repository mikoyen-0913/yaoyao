import React from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// 修正預設圖標問題
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const StoreLocationMap = ({ storeLocations }) => {
  if (!storeLocations || !Array.isArray(storeLocations)) {
    return (
      <div className="chart-card">
        <h2 className="section-title">分店分布地圖</h2>
        <div style={{ padding: 12 }}>尚無分店位置資料</div>
      </div>
    );
  }

  const validLocations = storeLocations.filter(
    (store) => store.latitude && store.longitude
  );

  const center = validLocations.length
    ? [validLocations[0].latitude, validLocations[0].longitude]
    : [25.04, 121.56];

  return (
    <div className="chart-card" style={{ width: "100%" }}>
      <h2 className="section-title">分店分布地圖</h2>
      <div style={{ height: 360, width: "100%", borderRadius: 12, overflow: "hidden" }}>
        <MapContainer center={center} zoom={12} scrollWheelZoom={false} style={{ height: "100%", width: "100%" }}>
          <TileLayer
            attribution="&copy; OpenStreetMap contributors"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {validLocations.map((store, index) => (
            <Marker key={index} position={[store.latitude, store.longitude]}>
              <Popup>
                <b>{store.store_name}</b><br />
                {store.address}<br />
                當月營收：{store.revenue} 元
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
};

export default StoreLocationMap;
