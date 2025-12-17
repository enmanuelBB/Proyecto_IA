from fpdf import FPDF
import matplotlib
matplotlib.use('Agg') 
import matplotlib.pyplot as plt
import io
import os
from datetime import datetime

class PDFReport(FPDF):
    def header(self):
        # Título
        self.set_font('Arial', 'B', 15)
        self.cell(0, 10, 'ElectrIA - Reporte de Consumo Energetico', 0, 1, 'C')
        self.ln(5)

    def footer(self):
        # Pie de página
        self.set_y(-15)
        self.set_font('Arial', 'I', 8)
        self.cell(0, 10, f'Pagina {self.page_no()}', 0, 0, 'C')

def generate_pdf_report(data_list):
    
    pdf = PDFReport()
    pdf.add_page()
    pdf.set_font('Arial', '', 12)

    #  Información General
    pdf.cell(0, 10, f'Fecha de Generacion: {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}', 0, 1)
    pdf.ln(5)

    #  Generar Gráfica
    if data_list:
       
        plot_data = data_list[-30:] if len(data_list) > 30 else data_list
        
        times = [d.get('time', '') for d in plot_data]
        real_values = [d.get('historical', 0) or 0 for d in plot_data]
        pred_values = [d.get('prediction', 0) or 0 for d in plot_data]

        plt.figure(figsize=(10, 5))
        plt.plot(times, real_values, label='Consumo Real (kW)', color='blue', marker='o')
        plt.plot(times, pred_values, label='Prediccion IA (kW)', color='orange', linestyle='--')
        
        plt.title('Comparativa: Real vs Prediccion (Ultimos 30 registros)')
        plt.xlabel('Hora')
        plt.ylabel('Potencia (kW)')
        plt.legend()
        plt.grid(True)
        plt.xticks(rotation=45)
        plt.tight_layout()

        
        img_buffer = io.BytesIO()
        plt.savefig(img_buffer, format='png', dpi=100)
        img_buffer.seek(0)
        plt.close()

     
        temp_img_path = "temp_chart.png"
        with open(temp_img_path, "wb") as f:
            f.write(img_buffer.getbuffer())
        
  
        pdf.image(temp_img_path, x=10, y=None, w=190)
        
      
        if os.path.exists(temp_img_path):
            os.remove(temp_img_path)
            
        pdf.ln(10)

    # 3. Tabla de Datos
    pdf.set_font('Arial', 'B', 10)
    
    # Encabezados
    col_width = 45
    pdf.cell(col_width, 10, 'Hora', 1)
    pdf.cell(col_width, 10, 'Real (kW)', 1)
    pdf.cell(col_width, 10, 'Prediccion (kW)', 1)
    pdf.cell(col_width, 10, 'Diferencia', 1)
    pdf.ln()

    pdf.set_font('Arial', '', 10)
    
    # Filas 
    display_data = data_list
    
    for row in display_data:
        t = row.get('time', '-')
        r = row.get('historical', 0) or 0
        p = row.get('prediction', 0) or 0
        diff = r - p

        pdf.cell(col_width, 10, str(t), 1)
        pdf.cell(col_width, 10, f"{r:.2f}", 1)
        pdf.cell(col_width, 10, f"{p:.2f}", 1)
        
        
        pdf.cell(col_width, 10, f"{diff:+.2f}", 1)
        pdf.ln()

    
    try:
       
        pdf_content = pdf.output(dest='S').encode('latin-1')
    except:
        
        pdf_content = pdf.output()

    return pdf_content
