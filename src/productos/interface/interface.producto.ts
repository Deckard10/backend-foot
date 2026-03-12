export interface ReporteCarga {
  productosNuevos: number;
  productosSaltados: number; 
  detalles: {
    marcasCreadas: string[];
    modelosCreados: string[];
    coloresCreados: string[];
    tallasCreadas: string[];
  };
}