/**
 * SOSA/SSN Models
 * Ontology W3C cho Sensors, Observations, Samples, and Actuators
 * Tham khảo: https://www.w3.org/TR/vocab-ssn/
 */

/**
 * Sensor: thiết bị hoặc quá trình đo lường
 */
export interface Sensor {
  id: string;
  type: 'Sensor';
  name: {
    type: 'Property';
    value: string;
  };
  description?: {
    type: 'Property';
    value: string;
  };
  observesProperty?: {
    type: 'Relationship';
    object: string; // urn:ngsi-ld:ObservableProperty:...
  };
  madeObservation?: {
    type: 'Relationship';
    object: string[]; // urn:ngsi-ld:Observation:...
  };
  madeSampling?: {
    type: 'Relationship';
    object: string[]; // urn:ngsi-ld:Sampling:...
  };
  '@context'?: string[];
}

/**
 * Observable Property: tính chất có thể quan sát được
 */
export interface ObservableProperty {
  id: string;
  type: 'ObservableProperty';
  name: {
    type: 'Property';
    value: string; // e.g., "temperature", "humidity", "air_quality"
  };
  unit?: {
    type: 'Property';
    value: string; // e.g., "CEL", "percent", "index"
  };
  '@context'?: string[];
}

/**
 * Observation: kết quả đo lường từ một cảm biến
 */
export interface Observation {
  id: string;
  type: 'Observation';
  resultTime: {
    type: 'Property';
    value: string; // ISO 8601 datetime
  };
  hasResult: {
    type: 'Property';
    value: number | string | object;
  };
  madeBySensor?: {
    type: 'Relationship';
    object: string; // urn:ngsi-ld:Sensor:...
  };
  observedProperty?: {
    type: 'Relationship';
    object: string; // urn:ngsi-ld:ObservableProperty:...
  };
  hasFeatureOfInterest?: {
    type: 'Relationship';
    object: string; // urn:ngsi-ld:FeatureOfInterest:...
  };
  '@context'?: string[];
}

/**
 * Actuator: thiết bị thực hiện hành động
 */
export interface Actuator {
  id: string;
  type: 'Actuator';
  name: {
    type: 'Property';
    value: string;
  };
  description?: {
    type: 'Property';
    value: string;
  };
  actsOnProperty?: {
    type: 'Relationship';
    object: string; // urn:ngsi-ld:ActuableProperty:...
  };
  madeActuation?: {
    type: 'Relationship';
    object: string[]; // urn:ngsi-ld:Actuation:...
  };
  '@context'?: string[];
}

/**
 * Sampling: quá trình lấy mẫu (e.g., một vị trí cụ thể, thời gian)
 */
export interface Sampling {
  id: string;
  type: 'Sampling';
  resultTime: {
    type: 'Property';
    value: string; // ISO 8601 datetime
  };
  madeBySensor?: {
    type: 'Relationship';
    object: string; // urn:ngsi-ld:Sensor:...
  };
  hasFeatureOfInterest?: {
    type: 'Relationship';
    object: string; // urn:ngsi-ld:FeatureOfInterest:...
  };
  '@context'?: string[];
}

/**
 * Feature of Interest: vật thể được quan sát (e.g., một vị trí, một cơ sở)
 */
export interface FeatureOfInterest {
  id: string;
  type: 'FeatureOfInterest';
  name?: {
    type: 'Property';
    value: string;
  };
  location?: {
    type: 'GeoProperty';
    value: {
      type: 'Point' | 'Polygon' | 'LineString';
      coordinates: number[] | number[][] | number[][][];
    };
  };
  '@context'?: string[];
}
