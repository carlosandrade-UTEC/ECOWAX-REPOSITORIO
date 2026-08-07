# Contexto del proyecto — ECOWAX Demand & Supply Intelligence

## Qué es
Producto de datos para la decisión de compra de insumos críticos importados.
NO es un dashboard. El ciclo obligatorio es:
dato → indicador → alerta → recomendación → decisión humana → resultado medido.

## Reglas de arquitectura (no negociables)
1. Toda fórmula de negocio vive en `src/engine/`. Ningún componente calcula nada.
2. Todo acceso a datos pasa por la interfaz `DataProvider`. Ningún componente importa JSON.
3. Toda escritura genera una fila en `app_auditoria`.
4. Ninguna operación borra filas: dar de baja es cambiar `estado`.
5. Cambiar una fórmula obliga a subir `RULES_VERSION` en `src/engine/version.ts`.
6. La app NUNCA emite una orden de compra. Solo recomienda y registra la decisión.
7. Los datos sintéticos se muestran siempre con la banda "MODO DEMOSTRACIÓN".

## Definiciones que se confunden
- posición de inventario = disponible − comprometido + en tránsito
- cobertura = días hasta agotar el stock contra la demanda ESTACIONAL mes a mes, nunca contra un promedio anual
- fill rate = Σ recibido / Σ solicitado sobre OC recibidas; las parciales cuentan con su cantidad real
- OTIF = a tiempo Y completo; un día de retraso invalida la línea

## URL de la API
- Apps Script: https://script.google.com/macros/s/AKfycbwBoKjhSJ-7NwN0PFO8HYWIwff52Hw3HktRf-rJZRY8oflRjd0ZvkMAeu-rZpf2SCNCuA/exec
- Token: ecowax_dsi_demo_20260807_mgrandi_k9x2q7n4p1r8s5t3v6w0y
