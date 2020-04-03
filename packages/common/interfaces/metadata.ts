export interface Metadata {
  key: string | number | symbol;
  value: any;
}

export interface ReflectResult {
  [key: string]: Metadata[];
}
