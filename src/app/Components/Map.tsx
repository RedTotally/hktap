import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet"; 

function Map() {

  const position: [number, number] = [22.27721888359386, 114.18466310486399];

  const customIcon = new L.Icon({
    iconUrl: "/location.svg",
    iconSize: [25, 41], 
    iconAnchor: [12, 41], 
    popupAnchor: [1, -34], 
  });

  return (
    <>
      <MapContainer
        className="w-full h-full relative z-[1]"
        center={[22.3193, 114.1694]}
        zoom={13}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <Marker position={position} icon={customIcon}>
          <Popup>
            <p>HPSHCC</p>
            <p>{position}</p>
            <a className="cursor-pointer">Vote</a>
          </Popup>
        </Marker>
      </MapContainer>
    </>
  );
}

export default Map;