import { DistrictBoundary } from './types';

export const SAMPLE_DISTRICTS: Record<string, DistrictBoundary> = {
  'Pune': {
    districtName: 'Pune',
    stateName: 'Maharashtra',
    center: [18.5204, 73.8567],
    polygonCoordinates: [
      [19.25, 73.30],
      [19.20, 74.30],
      [18.60, 74.80],
      [18.00, 74.40],
      [18.05, 73.40],
      [18.60, 73.30],
      [19.25, 73.30]
    ]
  },
  'Varanasi': {
    districtName: 'Varanasi',
    stateName: 'Uttar Pradesh',
    center: [25.3176, 82.9739],
    polygonCoordinates: [
      [25.55, 82.70],
      [25.60, 83.20],
      [25.20, 83.30],
      [25.05, 82.90],
      [25.15, 82.65],
      [25.55, 82.70]
    ]
  },
  'Jaipur': {
    districtName: 'Jaipur',
    stateName: 'Rajasthan',
    center: [26.9124, 75.7873],
    polygonCoordinates: [
      [27.40, 75.20],
      [27.50, 76.20],
      [26.70, 76.30],
      [26.50, 75.40],
      [26.70, 75.10],
      [27.40, 75.20]
    ]
  },
  'Coimbatore': {
    districtName: 'Coimbatore',
    stateName: 'Tamil Nadu',
    center: [11.0168, 76.9558],
    polygonCoordinates: [
      [11.35, 76.70],
      [11.40, 77.25],
      [10.75, 77.30],
      [10.60, 76.85],
      [10.90, 76.65],
      [11.35, 76.70]
    ]
  },
  'Patna': {
    districtName: 'Patna',
    stateName: 'Bihar',
    center: [25.5941, 85.1376],
    polygonCoordinates: [
      [25.80, 84.80],
      [25.85, 85.50],
      [25.40, 85.60],
      [25.25, 84.90],
      [25.50, 84.75],
      [25.80, 84.80]
    ]
  },
  'Ludhiana': {
    districtName: 'Ludhiana',
    stateName: 'Punjab',
    center: [30.9010, 75.8573],
    polygonCoordinates: [
      [31.15, 75.60],
      [31.20, 76.25],
      [30.65, 76.30],
      [30.55, 75.65],
      [30.75, 75.45],
      [31.15, 75.60]
    ]
  },
  'Ahmedabad': {
    districtName: 'Ahmedabad',
    stateName: 'Gujarat',
    center: [23.0225, 72.5714],
    polygonCoordinates: [
      [23.35, 72.30],
      [23.40, 72.90],
      [22.75, 72.95],
      [22.60, 72.35],
      [22.85, 72.15],
      [23.35, 72.30]
    ]
  },
  'Bengaluru Rural': {
    districtName: 'Bengaluru Rural',
    stateName: 'Karnataka',
    center: [13.2285, 77.5824],
    polygonCoordinates: [
      [13.55, 77.30],
      [13.60, 77.95],
      [12.95, 77.90],
      [12.85, 77.35],
      [13.15, 77.15],
      [13.55, 77.30]
    ]
  },
  'Kamrup': {
    districtName: 'Kamrup',
    stateName: 'Assam',
    center: [26.1445, 91.7362],
    polygonCoordinates: [
      [26.45, 91.40],
      [26.50, 92.10],
      [25.85, 92.05],
      [25.75, 91.45],
      [26.05, 91.25],
      [26.45, 91.40]
    ]
  },
  'Indore': {
    districtName: 'Indore',
    stateName: 'Madhya Pradesh',
    center: [22.7196, 75.8577],
    polygonCoordinates: [
      [23.00, 75.60],
      [23.05, 76.15],
      [22.45, 76.10],
      [22.35, 75.65],
      [22.60, 75.45],
      [23.00, 75.60]
    ]
  },
  'Ernakulam': {
    districtName: 'Ernakulam',
    stateName: 'Kerala',
    center: [9.9816, 76.2999],
    polygonCoordinates: [
      [10.25, 76.10],
      [10.30, 76.75],
      [9.70, 76.80],
      [9.60, 76.25],
      [9.85, 76.05],
      [10.25, 76.10]
    ]
  },
  'Khordha': {
    districtName: 'Khordha',
    stateName: 'Odisha',
    center: [20.2961, 85.8245],
    polygonCoordinates: [
      [20.55, 85.55],
      [20.60, 86.15],
      [19.95, 86.10],
      [19.85, 85.60],
      [20.15, 85.40],
      [20.55, 85.55]
    ]
  }
};

/**
 * Checks if a point [lat, lng] is inside a polygon using ray casting algorithm
 */
export function isPointInsidePolygon(point: [number, number], polygon: Array<[number, number]>): boolean {
  const [x, y] = point; // lat, lng
  let inside = false;
  
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [xi, yi] = polygon[i];
    const [xj, yj] = polygon[j];
    
    const intersect = ((yi > y) !== (yj > y)) &&
      (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  
  return inside;
}

/**
 * Haversine formula to calculate distance between two coordinates in meters
 */
export function calculateHaversineDistance(
  lat1: number, 
  lon1: number, 
  lat2: number, 
  lon2: number
): number {
  const R = 6371e3; // Earth's radius in meters
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) *
    Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
    
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
}
