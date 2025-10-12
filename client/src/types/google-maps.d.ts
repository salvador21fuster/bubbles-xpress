interface Window {
  google: typeof google;
}

declare namespace google {
  namespace maps {
    class Geocoder {
      geocode(
        request: any,
        callback: (results: any[], status: string) => void
      ): void;
    }

    namespace places {
      class AutocompleteService {
        getPlacePredictions(
          request: any,
          callback: (predictions: any[], status: any) => void
        ): void;
      }

      class PlacesService {
        constructor(attrContainer: HTMLElement);
      }

      enum PlacesServiceStatus {
        OK = 'OK',
      }
    }
  }
}
