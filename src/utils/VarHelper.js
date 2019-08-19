
export default class VarHelper {
  static parseVar (item) {
    if (typeof item === 'string') {
      return { label: item, value: item }
    } else if (typeof item === 'object') {
      if (Array.isArray(item)) {
        return false
      }
      if (!item.label && !item.value) {
        return false
      }

      item.label = item.label ? item.label : item.value
      item.value = item.value ? item.value : item.label
      return item
    }

    return false
  }

  static parseVars (arr) {
    const result = []
    arr.forEach(item => {
      const variable = this.parseVar(item)
      if (variable) {
        result.push(variable)
      }
    })
    return result
  }
}