export function formatDate(dateInput, { withTime = true, locale = 'es-ES' } = {}) {
  if (!dateInput) return '';
  const date = typeof dateInput === 'string' || typeof dateInput === 'number' ? new Date(dateInput) : dateInput;
  if (!(date instanceof Date) || isNaN(date)) return '';
  const dateOptions = { day: '2-digit', month: 'short', year: 'numeric' };
  const timeOptions = { hour: '2-digit', minute: '2-digit' };
  try {
    const dateStr = new Intl.DateTimeFormat(locale, dateOptions).format(date);
    if (withTime) {
      const timeStr = new Intl.DateTimeFormat(locale, timeOptions).format(date);
      return `${dateStr} ${timeStr}`;
    }
    return dateStr;
  } catch (e) {
    // Fallback simple formatting
    const d = date;
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    if (withTime) {
      const hh = String(d.getHours()).padStart(2, '0');
      const min = String(d.getMinutes()).padStart(2, '0');
      return `${dd}/${mm}/${yyyy} ${hh}:${min}`;
    }
    return `${dd}/${mm}/${yyyy}`;
  }
}

export default formatDate;
