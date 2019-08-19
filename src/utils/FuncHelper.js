
export default class FuncHelper {
  static builtInFunc () {
    return [
      { label: 'Log', value: 'log', num_params: 1 },
      { label: 'Log10', value: 'log10', num_params: 1 },
      { label: 'Log2', value: 'log2', num_params: 1 },
      { label: 'SUM', value: 'sum', num_params: 2 },
      { label: 'AVG', value: 'avg', num_params: 1 },
      { label: 'ABS', value: 'abs', num_params: 1 },
      { label: 'Round', value: 'round', num_params: 2 },
      { label: 'Year', value: 'year', num_params: 1 },
      { label: 'Month', value: 'month', num_params: 1 },
      { label: 'Day', value: 'day', num_params: 1 },
      { label: 'Date', value: 'date', num_params: 1 },
      { label: 'Now', value: 'now', num_params: 1 }
    ]
  }

  static parseFunc (func) {
    const builtInFuncs = this.builtInFunc()
    
    if (typeof func === "string") {
      for (let i = 0; i < builtInFuncs.length; i++) {
        const builtInFunc = builtInFuncs[i]
        if (builtInFunc.label.toUpperCase() === func.toUpperCase()) {
          return builtInFunc
        }
        if (builtInFunc.value.toUpperCase() === func.toUpperCase()) {
          return builtInFunc
        }
      }
      return { label: func, value: func, num_params: 1 }
    } else if (typeof func === 'object') {
      if (Array.isArray(func)) {
        return false
      } 
      if (!func.label && !func.value){
        return false
      } 
      func.label = func.label ? func.label : func.value
      func.value = func.value ? func.value : func.label
      func.num_params = func.num_params ? +func.num_params : 1
      return func
    }

    return false
  }

  static parseFuncs (arr) {
    const result = []
    arr.forEach(item => {
      const func = this.parseFunc(item)
      if (func) {
        result.push(func)
      }
    })
    return result
  }
}