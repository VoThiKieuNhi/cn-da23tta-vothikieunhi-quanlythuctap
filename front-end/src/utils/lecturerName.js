function validLecturerName(value) {
  if (typeof value !== 'string') return false;
  const words = value.normalize('NFC').trim().split(/\s+/);
  return words.length >= 2 && words.every(word => /^[\p{Script=Latin}]+$/u.test(word) && /[aeiouyàáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹ]/iu.test(word));
}
export default validLecturerName;
