import { useState, useEffect } from "react";
import { MFMap, MFMarker } from "react-map4d-map";

interface MapLocationPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onLocationSelect: (lat: number, lng: number, address?: string) => void;
  initialLocation?: {
    latitude: number;
    longitude: number;
  };
}

export function MapLocationPicker({
  isOpen,
  onClose,
  onLocationSelect,
  initialLocation,
}: MapLocationPickerProps) {
  const [selectedLocation, setSelectedLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(
    initialLocation
      ? {
          lat: initialLocation.latitude,
          lng: initialLocation.longitude,
        }
      : null
  );

  const [selectedAddress, setSelectedAddress] = useState<string>("");
  const [isGettingAddress, setIsGettingAddress] = useState(false);

  const mapOptions = {
    center: initialLocation
      ? { lat: initialLocation.latitude, lng: initialLocation.longitude }
      : { lat: 10.7769, lng: 106.7009 }, // Default to Ho Chi Minh City
    zoom: 15,
    controls: true,
    tilt: 0,
    bearing: 0,
  };

  const handleMapClick = async (event: any) => {
    const { lat, lng } = event.location;
    setSelectedLocation({ lat, lng });
    
    // Tự động lấy địa chỉ khi chọn vị trí
    await getReverseGeocode(lat, lng);
  };

  const getReverseGeocode = async (lat: number, lng: number) => {
    setIsGettingAddress(true);
    setSelectedAddress("");
    
    try {
      // Sử dụng OpenStreetMap Nominatim API (miễn phí)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1&accept-language=vi`
      );

      if (response.ok) {
        const data = await response.json();
        if (data && data.display_name) {
          setSelectedAddress(data.display_name);
        } else {
          setSelectedAddress(`${lat.toFixed(6)}, ${lng.toFixed(6)}`);
        }
      } else {
        setSelectedAddress(`${lat.toFixed(6)}, ${lng.toFixed(6)}`);
      }
    } catch (error) {
      console.error("Error getting address:", error);
      setSelectedAddress(`${lat.toFixed(6)}, ${lng.toFixed(6)}`);
    } finally {
      setIsGettingAddress(false);
    }
  };

  const handleConfirmLocation = () => {
    if (!selectedLocation) return;
    
    const address = selectedAddress || `${selectedLocation.lat.toFixed(6)}, ${selectedLocation.lng.toFixed(6)}`;
    onLocationSelect(selectedLocation.lat, selectedLocation.lng, address);
    onClose();
  };

  // Load địa chỉ ban đầu nếu có initialLocation
  useEffect(() => {
    if (initialLocation) {
      getReverseGeocode(initialLocation.latitude, initialLocation.longitude);
    }
  }, [initialLocation]);

  if (!isOpen) return null;

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="map-modal-overlay" onClick={handleOverlayClick}>
      <div className="map-modal-content">
        <div className="map-modal-header">
          <h3>Chọn vị trí trên bản đồ</h3>
          <button className="map-close-btn" onClick={onClose}>
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="map-container">
          <MFMap
            options={mapOptions}
            accessKey="16cd3f075c69e9a90748e76dd10e86e1"
            version="2.4"
            onClickLocation={handleMapClick}
          >
            {selectedLocation && (
              <MFMarker
                position={{
                  lat: selectedLocation.lat,
                  lng: selectedLocation.lng,
                }}
                anchor={{ x: 0.5, y: 1 }}
              />
            )}
          </MFMap>
        </div>

        <div className="map-modal-footer">
          <div className="location-info">
            {selectedLocation ? (
              <div>
                <p className="coordinates">
                  📍 Tọa độ: {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}
                </p>
                {isGettingAddress ? (
                  <p className="address-loading">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <circle
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeDasharray="31.416"
                        strokeDashoffset="31.416"
                      >
                        <animate
                          attributeName="stroke-dasharray"
                          dur="2s"
                          values="0 31.416;15.708 15.708;0 31.416"
                          repeatCount="indefinite"
                        />
                        <animate
                          attributeName="stroke-dashoffset"
                          dur="2s"
                          values="0;-15.708;-31.416"
                          repeatCount="indefinite"
                        />
                      </circle>
                    </svg>
                    Đang lấy địa chỉ...
                  </p>
                ) : selectedAddress ? (
                  <p className="address-text">
                    🏠 Địa chỉ: {selectedAddress}
                  </p>
                ) : null}
              </div>
            ) : (
              <p>👆 Chạm vào bản đồ để chọn vị trí</p>
            )}
          </div>

          <div className="map-modal-actions">
            <button className="map-cancel-btn" onClick={onClose}>
              Hủy
            </button>
            <button
              className="map-confirm-btn"
              onClick={handleConfirmLocation}
              disabled={!selectedLocation || isGettingAddress}
            >
              {isGettingAddress ? (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <circle
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeDasharray="31.416"
                      strokeDashoffset="31.416"
                    >
                      <animate
                        attributeName="stroke-dasharray"
                        dur="2s"
                        values="0 31.416;15.708 15.708;0 31.416"
                        repeatCount="indefinite"
                      />
                      <animate
                        attributeName="stroke-dashoffset"
                        dur="2s"
                        values="0;-15.708;-31.416"
                        repeatCount="indefinite"
                      />
                    </circle>
                  </svg>
                  Đang xử lý...
                </>
              ) : (
                "Xác nhận vị trí"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
