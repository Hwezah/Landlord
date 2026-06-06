"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { MapPin, X } from "lucide-react";

export type LatLng = { lat: number; lng: number };

type PermissionStatus =
  | "idle"
  | "asking"
  | "granted"
  | "denied"
  | "unsupported";

type LocationContextValue = {
  location: LatLng | null;
  error: string | null;
  permissionStatus: PermissionStatus;
  requestLocation: () => void;
};

const LocationContext = createContext<LocationContextValue | null>(null);

export function LocationProvider({
  children,
}: {
  children: ReactNode;
}): ReactNode {
  const [location, setLocation] = useState<LatLng | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [permissionStatus, setPermissionStatus] =
    useState<PermissionStatus>("idle");
  const [showModal, setShowModal] = useState(false);

  // Check if permission was already granted or denied previously
  useEffect(() => {
    if (!navigator.geolocation) {
      setPermissionStatus("unsupported");
      return;
    }

    // Check existing permission state without prompting
    navigator.permissions
      .query({ name: "geolocation" })
      .then((result) => {
        if (result.state === "granted") {
          // Already allowed before — silently get location
          setPermissionStatus("granted");
          fetchLocation();
        } else if (result.state === "denied") {
          setPermissionStatus("denied");
          setError("Location access was denied");
        } else {
          // "prompt" state — show our custom modal
          setShowModal(true);
          setPermissionStatus("idle");
        }
      })
      .catch(() => {
        // permissions API not supported — show modal anyway
        setShowModal(true);
      });
  }, []);

  function fetchLocation() {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
        setPermissionStatus("granted");
        setShowModal(false);
      },
      (err) => {
        setError(err.message || "Location unavailable");
        setPermissionStatus("denied");
        setShowModal(false);
      },
    );
  }

  function requestLocation() {
    setPermissionStatus("asking");
    fetchLocation();
  }

  function handleDismiss() {
    setShowModal(false);
    setPermissionStatus("denied");
    // Default to Kampala if user skips
    setLocation({ lat: 0.3476, lng: 32.5825 });
  }

  return (
    <LocationContext.Provider
      value={{ location, error, permissionStatus, requestLocation }}
    >
      {children}

      {/* Custom Location Permission Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={handleDismiss}
          />

          {/* Modal */}
          <div className="relative z-10 w-full sm:max-w-sm mx-4 sm:mx-auto bg-white rounded-t-3xl sm:rounded-2xl p-6 shadow-xl">
            {/* Dismiss button */}
            <button
              onClick={handleDismiss}
              className="absolute top-6 right-6 text-gray-400 hover:text-gray-600"
            >
              <X size={35} />
            </button>

            {/* Icon */}
            <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center mb-4">
              <MapPin size={28} className="text-blue-600" />
            </div>

            {/* Text */}
            <h2 className="text-lg font-semibold text-gray-900 mb-1">
              Find properties near you
            </h2>
            <p className="text-sm text-gray-500 mb-6">
              Allow Landlord to use your location so we can show you the closest
              available houses, offices and shops first.
            </p>

            {/* Buttons */}
            <div className="flex flex-col gap-2">
              <button
                onClick={requestLocation}
                disabled={permissionStatus === "asking"}
                className="w-full py-3 rounded-xl bg-blue-600 text-white font-medium text-sm
                           hover:bg-blue-700 active:scale-95 transition-all
                           disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {permissionStatus === "asking"
                  ? "Getting location..."
                  : "Allow location access"}
              </button>

              <button
                onClick={handleDismiss}
                className="w-full py-3 rounded-xl bg-gray-100 text-gray-600 font-medium text-sm
                           hover:bg-gray-200 active:scale-95 transition-all"
              >
                Not now — show all listings
              </button>
            </div>
          </div>
        </div>
      )}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  const ctx = useContext(LocationContext);
  if (!ctx) {
    throw new Error("useLocation must be used within LocationProvider");
  }
  return ctx;
}
