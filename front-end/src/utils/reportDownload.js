import api from '../services/api'
export async function downloadFile(url, filename) {
  try {
    const response = await api.get(url, { responseType: 'blob' })
    const objectUrl = URL.createObjectURL(response.data), link = document.createElement('a')
    const safeName = Array.from(filename || 'bao-cao').filter(char => char.charCodeAt(0) >= 32 && char.charCodeAt(0) !== 127).join('').replace(/[\\/]/g, '_')
    link.href = objectUrl; link.download = safeName || 'bao-cao'
    document.body.appendChild(link); link.click(); link.remove()
    setTimeout(() => URL.revokeObjectURL(objectUrl), 1000)
  } catch (error) {
    if (error.response?.data instanceof Blob) { try { error.response.data = JSON.parse(await error.response.data.text()) } catch { /* use fallback message */ } }
    throw error
  }
}
