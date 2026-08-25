const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const linkedInRegex = /^https?:\/\/([a-z]{2,3}\.)?linkedin\.com\/.*$/gim

export const isCorrectEmailFormat = (email: string | null): boolean => {
  return !!email && emailRegex.test(email)
}
export const isCorrectLinkedInFormat = (linkedIn: string | null) : boolean => {
   return !!linkedIn && linkedInRegex.test(linkedIn);
}
