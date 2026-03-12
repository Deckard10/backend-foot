import { Injectable } from '@nestjs/common';
import { Producto } from '../entities/producto.entity';
import PDFDocument from 'pdfkit';

@Injectable()
export class PdfService {
    async generarFichaProducto(producto: Producto): Promise<Buffer> {
        return new Promise((resolve) => {
            const doc = new PDFDocument({
                size: 'A4',
                margin: 0, 
            });

            const chunks: Buffer[] = [];
            doc.on('data', (chunk) => chunks.push(chunk));
            doc.on('end', () => resolve(Buffer.concat(chunks)));

            // --- CONFIGURACIÓN DE COLORES ---
            const primaryColor = '#1A1A1A'; 
            const accentColor = '#D91E1E';  
            const lightGray = '#F2F2F2';

            // --- ENCABEZADO (Header) ---
            doc.rect(0, 0, 600, 100).fill(primaryColor);
            
            doc.fillColor('#FFFFFF')
               .font('Helvetica-Bold')
               .fontSize(22)
               .text('FOOTLOOSE', 50, 40)
               .fontSize(12)
               .font('Helvetica')
               .text('CATÁLOGO OFICIAL DE PRODUCTOS', 50, 65);

            doc.rect(400, 0, 200, 100).fill(accentColor);
            doc.fillColor('#FFFFFF')
               .font('Helvetica-Bold')
               .fontSize(10)
               .text('FICHA TÉCNICA', 450, 45, { align: 'center' });

            // --- CUERPO DEL DOCUMENTO ---
            const startY = 140;

            // Nombre del Producto Destacado
            doc.fillColor(primaryColor)
               .font('Helvetica-Bold')
               .fontSize(24)
               .text(producto.nombreProducto.toUpperCase(), 50, startY);

            doc.moveDown(0.5);
            doc.rect(50, doc.y, 500, 2).fill(accentColor);
            doc.moveDown(1.5);

            // SECCIÓN DE DETALLES (Estilo Tabla)
            const drawRow = (label: string, value: string, y: number) => {
                doc.rect(50, y, 500, 25).fill(lightGray);
                doc.fillColor(primaryColor).font('Helvetica-Bold').fontSize(11).text(label, 65, y + 8);
                doc.font('Helvetica').fontSize(11).text(value, 200, y + 8);
            };

            let currentY = doc.y + 10;
            drawRow('MARCA', producto.marca.nombreMarca, currentY); currentY += 27;
            drawRow('MODELO', producto.modelo.nombreModelo, currentY); currentY += 27;
            drawRow('COLOR', producto.color.nombreColor, currentY); currentY += 27;
            drawRow('TALLA', producto.talla.nombreTalla, currentY); currentY += 27;

            // --- SECCIÓN DE PRECIO DESTACADO ---
            doc.moveDown(2);
            doc.fillColor(accentColor)
               .font('Helvetica-Bold')
               .fontSize(14)
               .text('PRECIO DE VENTA SUGERIDO:', 50, currentY + 20);
            
            doc.fontSize(28)
               .text(`S/ ${Number(producto.precioVenta).toFixed(2)}`, 50, currentY + 40);

            // --- PIE DE PÁGINA ---
            const footerY = 780;
            doc.rect(0, footerY, 600, 62).fill(lightGray);
            
            doc.fillColor('#555555')
               .font('Helvetica-Oblique')
               .fontSize(9)
               .text('Este documento es generado automáticamente por el sistema de inventario :3.', 50, footerY + 15, { align: 'center' })
               .text(`ID de Producto: ${producto.idProducto} - Fecha de generación: ${new Date().toLocaleDateString()}`, { align: 'center' });

            doc.end();
        });
    }
}