/* export function buildWhereClause(filters) {
  const conditions = [];

  // Iterar sobre cada propiedad en el objeto 'filters'
  for (const column in filters) {
    if (filters.hasOwnProperty(column)) {
      // Crear una condición para cada columna
      const values = filters[column];
      if (Array.isArray(values) && values.length > 0) {
        // Crear la parte para la columna (valor LIKE para listas de valores)
        const condition = `${column} LIKE '%${values.join("%' OR " + column + " LIKE '%")}%'`;
        conditions.push(`(${condition})`);  // Aseguramos que las condiciones OR estén agrupadas
      } else {
        // Si no es un array, tratamos como un único valor
        conditions.push(`${column} LIKE '%${values[0]}%'`);
      }
    }
  }

  // Unir todas las condiciones con 'AND' y devolver la cláusula completa
  return conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';
} */

export function buildWhereClause(filters) {
  if (Object.keys(filters).length === 0) {
    // filters es un objeto vacío
    return null
  }
  
  const conditions = [];

  // Iterar sobre cada propiedad en el objeto 'filters'
  for (const column in filters) {
    if (filters.hasOwnProperty(column)) {
      // Crear una condición para cada columna
      const values = filters[column];

      // Verificar si el valor es un array o un solo valor
      if (Array.isArray(values) && values.length > 0) {
        // Crear la parte para la columna (valor LIKE para listas de valores)
        const condition = `${column} LIKE '%${values.join("%' OR " + column + " LIKE '%")}%'`;
        conditions.push(`(${condition})`);  // Agrupamos la condición OR dentro de paréntesis
      } else {
        // Si no es un array, tratamos como un único valor
        conditions.push(`${column} LIKE '%${values[0]}%'`);
      }
    }
  }
  
  // Unir todas las condiciones con 'AND' y devolver la cláusula completa
  return conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';
}


export const formatearFecha = (fechaISO, conHora = false) => {
  const fecha = new Date(fechaISO);

  // Ajustar los valores a la zona horaria local
  const dia = String(fecha.getUTCDate()).padStart(2, "0");
  const mes = String(fecha.getUTCMonth() + 1).padStart(2, "0"); // Los meses van de 0 a 11
  const anio = fecha.getUTCFullYear();

  if (conHora) {
    const hora = String(fecha.getUTCHours()).padStart(2, "0"); // Hora UTC
    const minutos = String(fecha.getUTCMinutes()).padStart(2, "0"); // Minutos UTC
    return `${anio}-${mes}-${dia} ${hora}:${minutos}`;
  }

  return `${anio}-${mes}-${dia}`;
};