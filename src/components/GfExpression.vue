<template>
  <div>
    <buttons
      ref="Buttons"
      :funcs="parsedFuncs"
      :vars="parsedVars"
      :symbols="symbols"
      @func-select="onFuncSelect"
      @symbol-select="onSymbolSelect"
      @var-select="onVarSelect"/>
    <editor
      ref="Editor"
      :funcs="parsedFuncs"
      :vars="parsedVars"
      :symbols="symbols"
      :formula="formula"
      @on-change="onChange"/>
  </div>
</template>

<script>
import Buttons from './Buttons'
import Editor from './Editor'

import FuncHelper from '../utils/FuncHelper'
import VarHelper from '../utils/VarHelper'

export default {
  name: 'gf-expression',
  components: {
    Buttons,
    Editor
  },
  props: {
    funcs: { type: Array, default: () => ['Log', 'Log10'] },
    vars: { type: Array, default: () => [] },
    symbols: { type: Array, default: () => ['+', '-', '*', '/'] },
    formula: { type: String, default: '' }
  },
  computed: {
    parsedFuncs() {
      return FuncHelper.parseFuncs(this.funcs)
    },
    parsedVars() {
      return VarHelper.parseVars(this.vars)
    }
  },
  methods: {
    getFormula () {
      return this.$refs.Editor.getFormula()
    },
    onFuncSelect (func) {
      return this.$refs.Editor.insertAfterCursor([
        { component: 'area-func', content: func, focus: func.num_params > 0 ? true : false }, 
        { component: 'area-input', content: '' }
      ])
    },
    onSymbolSelect (symbol) {
      return this.$refs.Editor.insertAfterCursor([
        { component: 'area-symbol', content: symbol }, 
        { component: 'area-input', content: '' }
      ])
    },
    onVarSelect (variable) {
      return this.$refs.Editor.insertAfterCursor([
        { component: 'area-var', content: variable }, 
        { component: 'area-input', content: '' }
      ])
    },
    onChange (e) {
      this.$emit('on-change', e)
    },
    pluckFuncs () {
      return this.$refs.Editor.pluckFuncs()
    },
    pluckVars () {
      return this.$refs.Editor.pluckVars()
    },
    pluckSymbols () {
      return this.$refs.Editor.pluckSymbols()
    }
  }
}
</script>
