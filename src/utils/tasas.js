const formatNumber = (str) =>
  str ? parseFloat(String(str).replace(/\./g, "").replace(",", ".")) || 0 : 0;

const esFechaValida = (fechaStr) => {
  // 1. Verificar formato YYYY-MM-DD con Regex
  const regexFecha = /^\d{4}-\d{2}-\d{2}$/;
  if (!regexFecha.test(fechaStr)) return false;

  // 2. Verificar que sea una fecha válida en el calendario
  const [year, month, day] = fechaStr.split("-").map(Number);
  const fecha = new Date(year, month - 1, day);

  return (
    fecha.getFullYear() === year &&
    fecha.getMonth() === month - 1 &&
    fecha.getDate() === day
  );
};

module.exports = {
  formatNumber,
  esFechaValida,
};
