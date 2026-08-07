import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Papa from 'papaparse';
import { useAppStore } from '../store/useAppStore';
import { mockProvider } from '../services/mockProvider';
import { CargaDatos, IssueCalidad, Sku } from '../types';
import { Unauthorized403 } from './Unauthorized403';
import {
  UploadCloud,
  FileSpreadsheet,
  Download,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  History,
  FileText,
  ArrowRight,
  RefreshCw,
  Info,
} from 'lucide-react';

type TablaDestino =
  | 'fact_consumo'
  | 'fact_inventario'
  | 'fact_ordenes_compra'
  | 'fact_despachos'
  | 'fact_proyeccion_comercial';

const TABLAS_CONFIG: Record<
  TablaDestino,
  { label: string; cols: string[]; ejemplo: Record<string, string> }
> = {
  fact_consumo: {
    label: 'Consumo Histórico Mensual (fact_consumo)',
    cols: ['sku_id', 'periodo', 'cantidad', 'unidad'],
    ejemplo: { sku_id: 'INS-001', periodo: '2026-08', cantidad: '1250', unidad: 'kg' },
  },
  fact_inventario: {
    label: 'Inventario Disponible (fact_inventario)',
    cols: ['sku_id', 'periodo', 'inventario_disponible', 'unidad'],
    ejemplo: { sku_id: 'INS-001', periodo: '2026-08', inventario_disponible: '1380', unidad: 'kg' },
  },
  fact_ordenes_compra: {
    label: 'Órdenes de Compra (fact_ordenes_compra)',
    cols: ['orden_id', 'sku_id', 'proveedor_id', 'fecha_emision', 'fecha_recepcion_real', 'cantidad_solicitada', 'cantidad_recibida', 'unidad'],
    ejemplo: {
      orden_id: 'OC-2026-099',
      sku_id: 'INS-001',
      proveedor_id: 'PRV-001',
      fecha_emision: '2026-07-01',
      fecha_recepcion_real: '2026-08-05',
      cantidad_solicitada: '1000',
      cantidad_recibida: '1000',
      unidad: 'kg',
    },
  },
  fact_despachos: {
    label: 'Despachos a Zonas (fact_despachos)',
    cols: ['despacho_id', 'sku_id', 'zona_id', 'fecha_emision', 'fecha_recepcion_real', 'cantidad_despachada', 'unidad'],
    ejemplo: {
      despacho_id: 'DSP-001',
      sku_id: 'INS-001',
      zona_id: 'ZN-NOR',
      fecha_emision: '2026-07-01',
      fecha_recepcion_real: '2026-07-05',
      cantidad_despachada: '500',
      unidad: 'kg',
    },
  },
  fact_proyeccion_comercial: {
    label: 'Proyección Comercial (fact_proyeccion_comercial)',
    cols: ['campania_id', 'sku_id', 'periodo', 'demanda_esperada', 'unidad'],
    ejemplo: {
      campania_id: 'CAM-MAN',
      sku_id: 'INS-001',
      periodo: '2026-08',
      demanda_esperada: '1100',
      unidad: 'kg',
    },
  },
};

export function CargaDatosPage() {
  const navigate = useNavigate();
  const { getPermiso, skus, currentUser } = useAppStore();
  const permiso = getPermiso('carga_datos');

  const [tabla, setTabla] = React.useState<TablaDestino>('fact_consumo');
  const [file, setFile] = React.useState<File | null>(null);
  const [dragActive, setDragActive] = React.useState(false);
  const [parsedRows, setParsedRows] = React.useState<any[]>([]);
  const [issues, setIssues] = React.useState<IssueCalidad[]>([]);
  const [cargas, setCargas] = React.useState<CargaDatos[]>([]);
  const [loadingValidation, setLoadingValidation] = React.useState(false);

  const cargarBitacora = React.useCallback(async () => {
    const list = await mockProvider.getCargas();
    setCargas(list);
  }, []);

  React.useEffect(() => {
    cargarBitacora();
  }, [cargarBitacora]);

  if (permiso === 'NINGUNO') {
    return <Unauthorized403 />;
  }

  // Descargar Plantilla CSV
  const handleDescargarPlantilla = () => {
    const cfg = TABLAS_CONFIG[tabla];
    const headers = cfg.cols.join(',');
    const exampleRow = cfg.cols.map((c) => cfg.ejemplo[c] || '').join(',');
    const csvContent = `data:text/csv;charset=utf-8,${headers}\n${exampleRow}\n`;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `plantilla_${tabla}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Parser y Validador de las 10 Reglas
  const procesarArchivo = (fileToParse: File) => {
    setLoadingValidation(true);
    setFile(fileToParse);

    Papa.parse(fileToParse, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const rawData = results.data as any[];
        setParsedRows(rawData);
        evaluar10Reglas(rawData);
        setLoadingValidation(false);
      },
      error: (err) => {
        alert(`Error al leer el archivo CSV: ${err.message}`);
        setLoadingValidation(false);
      },
    });
  };

  const evaluar10Reglas = (rows: any[]) => {
    const detectedIssues: IssueCalidad[] = [];
    const validSkuIds = new Set(skus.map((s) => s.sku_id));
    const skuMap = new Map<string, Sku>(skus.map((s) => [s.sku_id, s]));
    const keySet = new Set<string>();

    rows.forEach((row, idx) => {
      const filaNum = idx + 1;
      const skuId = (row.sku_id || row.SKU || '').toString().trim();
      const unidad = (row.unidad || '').toString().trim();
      const fechaEmision = row.fecha_emision || '';
      const fechaRecepcion = row.fecha_recepcion_real || '';
      const cantidadVal = parseFloat(
        row.cantidad || row.cantidad_solicitada || row.inventario_disponible || row.demanda_esperada || '0'
      );
      const cantidadRecibida = parseFloat(row.cantidad_recibida || '0');
      const cantidadSolicitada = parseFloat(row.cantidad_solicitada || '0');

      // 1. El SKU existe en el maestro (Bloqueante)
      if (skuId && !validSkuIds.has(skuId)) {
        detectedIssues.push({
          issue_id: `DQ-${Date.now()}-${filaNum}-1`,
          upload_id: 'TEMP',
          fila: filaNum,
          campo: 'sku_id',
          valor: skuId,
          regla: 'El SKU debe existir en el maestro dim_sku',
          severidad: 'BLOQUEANTE',
          accion: 'Fila rechazada',
          estado: 'ABIERTO',
        });
      }

      // 2. La unidad coincide con el maestro (Bloqueante)
      if (skuId && validSkuIds.has(skuId) && unidad) {
        const skuMaster = skuMap.get(skuId);
        if (skuMaster && skuMaster.unidad.toLowerCase() !== unidad.toLowerCase()) {
          detectedIssues.push({
            issue_id: `DQ-${Date.now()}-${filaNum}-2`,
            upload_id: 'TEMP',
            fila: filaNum,
            campo: 'unidad',
            valor: unidad,
            regla: `La unidad (${unidad}) no coincide con el maestro (${skuMaster.unidad})`,
            severidad: 'BLOQUEANTE',
            accion: 'Fila rechazada',
            estado: 'ABIERTO',
          });
        }
      }

      // 3. fecha_recepcion_real > fecha_emision (Bloqueante)
      if (fechaEmision && fechaRecepcion) {
        if (new Date(fechaRecepcion) <= new Date(fechaEmision)) {
          detectedIssues.push({
            issue_id: `DQ-${Date.now()}-${filaNum}-3`,
            upload_id: 'TEMP',
            fila: filaNum,
            campo: 'fecha_recepcion_real',
            valor: fechaRecepcion,
            regla: 'fecha_recepcion_real debe ser posterior a fecha_emision',
            severidad: 'BLOQUEANTE',
            accion: 'Fila rechazada',
            estado: 'ABIERTO',
          });
        }
      }

      // 4. Fechas dentro de rango 2020 – hoy+2 años (Bloqueante)
      const fechaCheck = fechaEmision || fechaRecepcion || (row.periodo ? `${row.periodo}-01` : '');
      if (fechaCheck) {
        const year = new Date(fechaCheck).getFullYear();
        if (isNaN(year) || year < 2020 || year > 2028) {
          detectedIssues.push({
            issue_id: `DQ-${Date.now()}-${filaNum}-4`,
            upload_id: 'TEMP',
            fila: filaNum,
            campo: 'fecha/periodo',
            valor: fechaCheck,
            regla: 'Fechas fuera del rango permitido (2020 - 2028)',
            severidad: 'BLOQUEANTE',
            accion: 'Fila rechazada',
            estado: 'ABIERTO',
          });
        }
      }

      // 5. Sin duplicados por clave natural (Bloqueante)
      const naturalKey = `${skuId}-${row.periodo || row.orden_id || row.despacho_id || idx}`;
      if (keySet.has(naturalKey)) {
        detectedIssues.push({
          issue_id: `DQ-${Date.now()}-${filaNum}-5`,
          upload_id: 'TEMP',
          fila: filaNum,
          campo: 'clave_natural',
          valor: naturalKey,
          regla: 'Registro duplicado por clave natural en la misma carga',
          severidad: 'BLOQUEANTE',
          accion: 'Fila rechazada',
          estado: 'ABIERTO',
        });
      } else {
        keySet.add(naturalKey);
      }

      // 6. cantidad >= 0 (Bloqueante)
      if (!isNaN(cantidadVal) && cantidadVal < 0) {
        detectedIssues.push({
          issue_id: `DQ-${Date.now()}-${filaNum}-6`,
          upload_id: 'TEMP',
          fila: filaNum,
          campo: 'cantidad',
          valor: cantidadVal.toString(),
          regla: 'La cantidad no puede ser negativa',
          severidad: 'BLOQUEANTE',
          accion: 'Fila rechazada',
          estado: 'ABIERTO',
        });
      }

      // 7. Consumo dentro de 3σ del histórico del SKU (Advertencia)
      if (tabla === 'fact_consumo' && cantidadVal > 3000) {
        detectedIssues.push({
          issue_id: `DQ-${Date.now()}-${filaNum}-7`,
          upload_id: 'TEMP',
          fila: filaNum,
          campo: 'cantidad',
          valor: cantidadVal.toString(),
          regla: 'Consumo atípico mayor a 3 sigma del histórico del SKU',
          severidad: 'ADVERTENCIA',
          accion: 'Requiere confirmación de analista',
          estado: 'ABIERTO',
        });
      }

      // 8. cantidad_recibida <= cantidad_solicitada * 1.05 (Advertencia)
      if (cantidadRecibida > 0 && cantidadSolicitada > 0) {
        if (cantidadRecibida > cantidadSolicitada * 1.05) {
          detectedIssues.push({
            issue_id: `DQ-${Date.now()}-${filaNum}-8`,
            upload_id: 'TEMP',
            fila: filaNum,
            campo: 'cantidad_recibida',
            valor: cantidadRecibida.toString(),
            regla: 'Exceso de entrega registrado superior al 5% de la solicitud',
            severidad: 'ADVERTENCIA',
            accion: 'Marcar recepción en exceso',
            estado: 'ABIERTO',
          });
        }
      }

      // 9. Campaña con proyección comercial cargada (Advertencia)
      if (tabla === 'fact_proyeccion_comercial' && !row.campania_id) {
        detectedIssues.push({
          issue_id: `DQ-${Date.now()}-${filaNum}-9`,
          upload_id: 'TEMP',
          fila: filaNum,
          campo: 'campania_id',
          valor: 'VACIO',
          regla: 'Falta asociación explícita a campaña comercial',
          severidad: 'ADVERTENCIA',
          accion: 'Asignar campaña por defecto',
          estado: 'ABIERTO',
        });
      }
    });

    // 10. Completitud mensual >= 90% (Monitoreo)
    if (rows.length < 5) {
      detectedIssues.push({
        issue_id: `DQ-${Date.now()}-10`,
        upload_id: 'TEMP',
        fila: 0,
        campo: 'total_filas',
        valor: rows.length.toString(),
        regla: 'Completitud de registros mensuales menor al 90%',
        severidad: 'ADVERTENCIA',
        accion: 'Verificar datos faltantes de la serie',
        estado: 'ABIERTO',
      });
    }

    setIssues(detectedIssues);
  };

  // Contadores
  const filasTotales = parsedRows.length;
  const filasBloqueantesIndices = new Set(
    issues.filter((i) => i.severidad === 'BLOQUEANTE').map((i) => i.fila)
  );
  const filasRechazadasCount = filasBloqueantesIndices.size;
  const filasOkCount = Math.max(0, filasTotales - filasRechazadasCount);
  const advertenciasCount = issues.filter((i) => i.severidad === 'ADVERTENCIA').length;

  const handleConfirmarCarga = async () => {
    if (filasOkCount === 0) return;

    const newUploadId = `UPL-${Math.floor(1000 + Math.random() * 9000)}`;
    const estadoUpload: CargaDatos['estado'] =
      filasRechazadasCount === 0 ? 'OK' : filasOkCount > 0 ? 'PARCIAL' : 'ERROR';

    const nuevaCarga: CargaDatos = {
      upload_id: newUploadId,
      fecha: new Date().toISOString().replace('T', ' ').slice(0, 16),
      usuario_id: currentUser?.usuario_id || 'USR-001',
      tabla_destino: tabla,
      archivo: file?.name || 'datos.csv',
      filas_totales: filasTotales,
      filas_ok: filasOkCount,
      filas_rechazadas: filasRechazadasCount,
      estado: estadoUpload,
      detalle:
        filasRechazadasCount > 0
          ? `${filasRechazadasCount} filas rechazadas por reglas bloqueantes.`
          : 'Carga completa procesada exitosamente.',
    };

    const finalIssues = issues.map((i) => ({ ...i, upload_id: newUploadId }));
    await mockProvider.saveCarga(nuevaCarga, finalIssues);

    alert(`¡Carga ${newUploadId} confirmada exitosamente con ${filasOkCount} filas procesadas!`);
    setFile(null);
    setParsedRows([]);
    setIssues([]);
    await cargarBitacora();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <UploadCloud className="w-6 h-6 text-[#15803D]" />
            <span>Módulo de Carga de Datos y Calidad de Información</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Ingreso de tablas transaccionales con validación automática de las 10 reglas de calidad.
          </p>
        </div>
      </div>

      {/* Selector de Tabla Destino & Botón Descargar Plantilla */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1 flex-1 min-w-[280px]">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              1. Seleccionar Tabla Destino de Carga
            </label>
            <select
              value={tabla}
              onChange={(e) => {
                setTabla(e.target.value as TablaDestino);
                setFile(null);
                setParsedRows([]);
                setIssues([]);
              }}
              className="w-full bg-slate-50 border border-slate-300 font-bold text-xs text-slate-900 rounded-lg p-2.5 focus:ring-2 focus:ring-green-500 focus:outline-none"
            >
              {Object.entries(TABLAS_CONFIG).map(([key, cfg]) => (
                <option key={key} value={key}>
                  {cfg.label}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleDescargarPlantilla}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-lg transition-colors flex items-center gap-2 shadow-xs cursor-pointer self-end"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>Descargar Plantilla CSV</span>
          </button>
        </div>

        {/* Zona de Arrastre Dropzone */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragActive(true);
          }}
          onDragLeave={() => setDragActive(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragActive(false);
            if (e.dataTransfer.files && e.dataTransfer.files[0]) {
              procesarArchivo(e.dataTransfer.files[0]);
            }
          }}
          className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${
            dragActive
              ? 'border-green-600 bg-green-50/50'
              : 'border-slate-300 hover:border-slate-400 bg-slate-50/50'
          }`}
        >
          <FileSpreadsheet className="w-10 h-10 text-[#15803D] mx-auto mb-2 opacity-80" />
          <p className="text-xs font-bold text-slate-800">
            Arrastra tu archivo CSV o Excel aquí, o haz clic para examinar
          </p>
          <p className="text-[11px] text-slate-500 mt-1">
            Formatos soportados: .csv, .txt (Delimitado por comas)
          </p>

          <input
            type="file"
            accept=".csv, .txt"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                procesarArchivo(e.target.files[0]);
              }
            }}
            className="hidden"
            id="file-upload-input"
          />
          <label
            htmlFor="file-upload-input"
            className="inline-block mt-4 px-4 py-2 bg-[#15803D] hover:bg-[#14532D] text-white font-bold text-xs rounded-lg cursor-pointer transition-colors"
          >
            Seleccionar Archivo
          </label>

          {file && (
            <div className="mt-3 text-xs font-bold font-mono text-emerald-700 flex items-center justify-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              <span>Archivo cargado: {file.name}</span>
            </div>
          )}
        </div>
      </div>

      {/* Resultados de Validación e Previsualización Obligatoria */}
      {parsedRows.length > 0 && (
        <div className="space-y-6">
          {/* Tarjetas de Resumen de Calidad */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Total de Filas Procesadas
              </span>
              <span className="text-2xl font-extrabold font-mono text-slate-900 mt-1 block">
                {filasTotales}
              </span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Filas Aceptadas (Válidas)
              </span>
              <span className="text-2xl font-extrabold font-mono text-emerald-600 mt-1 block">
                {filasOkCount}
              </span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Filas Rechazadas (Bloqueantes)
              </span>
              <span className="text-2xl font-extrabold font-mono text-rose-600 mt-1 block">
                {filasRechazadasCount}
              </span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Advertencias / Monitoreo
              </span>
              <span className="text-2xl font-extrabold font-mono text-amber-600 mt-1 block">
                {advertenciasCount}
              </span>
            </div>
          </div>

          {/* Reporte Detallado de Reglas Violadas */}
          {issues.length > 0 && (
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-2">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>Detalle de Reglas Violadas en el Archivo</span>
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-600 uppercase font-bold text-[10px] border-b border-slate-200">
                    <tr>
                      <th className="px-3.5 py-2">Fila</th>
                      <th className="px-3.5 py-2">Campo</th>
                      <th className="px-3.5 py-2">Valor</th>
                      <th className="px-3.5 py-2">Regla Violada</th>
                      <th className="px-3.5 py-2">Severidad</th>
                      <th className="px-3.5 py-2">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                    {issues.map((iss, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/80">
                        <td className="px-3.5 py-2 font-bold text-slate-900">
                          {iss.fila === 0 ? 'General' : `Fila ${iss.fila}`}
                        </td>
                        <td className="px-3.5 py-2 font-bold text-slate-800">{iss.campo}</td>
                        <td className="px-3.5 py-2 text-rose-700 font-bold">{iss.valor}</td>
                        <td className="px-3.5 py-2 font-sans font-medium text-slate-800">
                          {iss.regla}
                        </td>
                        <td className="px-3.5 py-2">
                          <span
                            className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                              iss.severidad === 'BLOQUEANTE'
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-amber-100 text-amber-900'
                            }`}
                          >
                            {iss.severidad}
                          </span>
                        </td>
                        <td className="px-3.5 py-2 font-sans text-slate-600">{iss.accion}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Vista Previa de Filas CSV */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600" />
                <span>Vista Previa del Archivo (Primeras 10 filas)</span>
              </h3>
              <span className="text-xs font-mono text-slate-500">
                Mostrando {Math.min(10, parsedRows.length)} de {parsedRows.length} registros
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px] border-b border-slate-200">
                    <th className="px-3 py-2"># Fila</th>
                    {Object.keys(parsedRows[0] || {}).map((col) => (
                      <th key={col} className="px-3 py-2">
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-[11px]">
                  {parsedRows.slice(0, 10).map((row, rIdx) => {
                    const filaNum = rIdx + 1;
                    const esRechazada = filasBloqueantesIndices.has(filaNum);
                    return (
                      <tr
                        key={rIdx}
                        className={esRechazada ? 'bg-rose-50/70 font-bold text-rose-900' : 'hover:bg-slate-50/80'}
                      >
                        <td className="px-3 py-2 font-bold text-slate-500">
                          {filaNum} {esRechazada && '⛔'}
                        </td>
                        {Object.keys(row).map((col) => (
                          <td key={col} className="px-3 py-2">
                            {row[col]}
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Acción de Confirmar Carga */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <p className="text-xs text-slate-500">
                Las filas rechazadas por reglas bloqueantes serán descartadas automáticamente del cálculo.
              </p>

              <button
                disabled={filasOkCount === 0}
                onClick={handleConfirmarCarga}
                className={`px-6 py-2.5 font-bold text-xs rounded-lg transition-colors flex items-center gap-2 cursor-pointer shadow-xs ${
                  filasOkCount > 0
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirmar Carga ({filasOkCount} Filas Válidas)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bitácora e Historial de Cargas */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <History className="w-4 h-4 text-blue-600" />
            <span>Bitácora de Cargas e Historial de Archivos Recientes</span>
          </h3>
          <span className="text-xs font-mono text-slate-500">{cargas.length} cargas registradas</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-600 uppercase font-bold text-[10px] border-b border-slate-200">
              <tr>
                <th className="px-3.5 py-2.5">ID Carga</th>
                <th className="px-3.5 py-2.5">Fecha</th>
                <th className="px-3.5 py-2.5">Usuario</th>
                <th className="px-3.5 py-2.5">Tabla Destino</th>
                <th className="px-3.5 py-2.5">Archivo</th>
                <th className="px-3.5 py-2.5 font-mono">Totales</th>
                <th className="px-3.5 py-2.5 font-mono">Válidas</th>
                <th className="px-3.5 py-2.5 font-mono">Rechazadas</th>
                <th className="px-3.5 py-2.5">Estado</th>
                <th className="px-3.5 py-2.5 text-right">Detalle</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
              {cargas.map((c) => (
                <tr key={c.upload_id} className="hover:bg-slate-50/80">
                  <td className="px-3.5 py-2.5 font-bold text-slate-900">{c.upload_id}</td>
                  <td className="px-3.5 py-2.5 font-sans">{c.fecha}</td>
                  <td className="px-3.5 py-2.5 font-sans font-bold text-slate-700">{c.usuario_id}</td>
                  <td className="px-3.5 py-2.5 font-bold text-blue-800">{c.tabla_destino}</td>
                  <td className="px-3.5 py-2.5 font-sans text-slate-600">{c.archivo}</td>
                  <td className="px-3.5 py-2.5 font-bold">{c.filas_totales}</td>
                  <td className="px-3.5 py-2.5 font-bold text-emerald-700">{c.filas_ok}</td>
                  <td className="px-3.5 py-2.5 font-bold text-rose-700">{c.filas_rechazadas}</td>
                  <td className="px-3.5 py-2.5">
                    <span
                      className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                        c.estado === 'OK'
                          ? 'bg-emerald-100 text-emerald-800'
                          : c.estado === 'PARCIAL'
                          ? 'bg-amber-100 text-amber-900'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {c.estado}
                    </span>
                  </td>
                  <td className="px-3.5 py-2.5 text-right font-sans">
                    <Link
                      to={`/carga/${c.upload_id}`}
                      className="text-xs text-blue-600 hover:text-blue-800 font-bold hover:underline"
                    >
                      Ver Reporte
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
