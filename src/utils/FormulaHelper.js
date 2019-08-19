Array.prototype.spliceArray = function(index, n, array) {
  return Array.prototype.splice.apply(this, [index, n].concat(array));
}

export default class FormulaHelper {
  constructor (funcs, vars, symbols) {
    this.funcs = funcs
    this.vars = vars
    this.symbols = symbols
  }
  
  parse (formula) {
    let finish = false
    let result = [formula]

    while (!finish) {
      finish = true
      for (let i = 0; i < result.length; i++) {
        if (typeof result[i] === 'string') {
          finish = false
          let pieces = this.doParse(result[i])
          result.spliceArray(i, 1, pieces)
          break
        }
      }
    }

    return result
  }

  doParse (formula) {
    let pieces = []
    if (formula.indexOf('(') > -1) {
      pieces = this.parseQuoteOrFunc(formula)  
    } else if (formula.indexOf('`') > -1) {
      pieces = this.parseVar(formula)
    } else {
      pieces = this.parseSymbol(formula)
    }
    return pieces
  }

  parseSymbol (formula) {
    if (!formula || !formula.trim()) {
      return []
    }
    
    for (let i = 0; i < this.symbols.length; i++) {
      const symbol = this.symbols[i]
      const index = formula.indexOf(symbol)
      if (index > -1) {
        return [
          formula.substring(0, index),
          { component: 'area-symbol', formula: symbol },
          formula.substring(index + symbol.length + 1)
        ]
      }
    }

    return { component: 'area-input', formula: formula }
  }

  parseVar (formula) {
    if (!formula || !formula.trim()) {
      return []
    }

    const varIndex = this.firstVarIndex(formula)
    if (varIndex[0] === -1) {
      return [formula]
    }

    let varStr = formula.substring(varIndex[0] + 1, varIndex[1])
    let variable = this.vars.find(item => {
      if (varStr.toUpperCase() === item.label.toUpperCase()) {
        return true
      }
      if (varStr.toUpperCase() === item.value.toUpperCase()) {
        return true
      }
      return false
    })

    if (variable) {
      return [
        formula.substring(0, varIndex[0]),
        { component: 'area-var', formula: variable },
        formula.substring(varIndex[1] + 1)
      ]
    } else {
      return [
        formula.substring(0, varIndex[0]) + ' ' + 
        formula.substring(varIndex[0] + 1, varIndex[1]) + ' ' + 
        formula.substring(varIndex[1] + 1)
      ]
    }
  }

  parseQuoteOrFunc (formula) {
    if (!formula || !formula.trim()) {
      return []
    }

    const quoteIndex = this.firstQuoteIndex(formula)
    if (quoteIndex[0] === -1) {
      return [formula]
    }
    
    let funcStr = ''
    for (let i = quoteIndex[0] - 1; i >=0; i--) {
      if (/^[A-Za-z0-9]$/i.test(formula[i])) {
        funcStr = formula[i] + funcStr
      } else {
        break
      }
    }

    let func = null
    if (funcStr) {
      func = this.funcs.find(item => {
        if (funcStr.toUpperCase() === item.label.toUpperCase()) {
          return true
        }
        if (funcStr.toUpperCase() === item.value.toUpperCase()) {
          return true
        }
        return false
      })
    }

    if (func) {
      return [
        formula.substring(0, quoteIndex[0] - funcStr.length),
        { component: 'area-func', formula: [func, formula.substring(quoteIndex[0] + 1, quoteIndex[1])] },
        formula.substring(quoteIndex[1] + 1)
      ]
    } else {
      return [
        formula.substring(0, quoteIndex[0]),
        { component: 'area-quote', formula: formula.substring(quoteIndex[0] + 1, quoteIndex[1]) },
        formula.substring(quoteIndex[1] + 1)
      ]
    }
  }

  firstVarIndex (formula) {
    const startIndex = formula.indexOf('`')
    if (startIndex === -1) {
      return [-1, -1]
    }
    const endIndex = formula.indexOf('`', startIndex + 1)
    return [startIndex, endIndex]
  }

  firstQuoteIndex (formula) {
    const startIndex = formula.indexOf('(')
    if (startIndex === -1) {
      return [-1, -1]
    }

    let depth = 1
    for (let i = startIndex + 1; i < formula.length; i++) {
      if (formula[i] === '(') {
        depth ++
      } else if (formula[i] === ')') {
        depth --
        if (depth === 0) {
          return [startIndex, i]
        }
      }
    }

    return [startIndex, startIndex]
  }
}