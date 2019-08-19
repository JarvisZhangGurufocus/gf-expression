<template>
  <div id="app">
    <gf-expression
      ref="GfExpression"
      :funcs="funcs"
      :vars="vars"
      :symbols="symbols"
      :formula="formula"
      @on-change="onChange"/>

    <div style="margin-top: 30px"> Formula: </div>
    <input v-model="formula" style="width: 100%">
    <div style="margin-top: 30px"> Components: </div>
    <div> {{ usedFuncs }} </div>
    <div> {{ usedVars }} </div>
    <div> {{ usedSymbols }} </div>
  </div>
</template>

<script>
import _ from 'lodash'
import GfExpression from './components/GfExpression'

export default {
  components: {
    GfExpression
  },
  data () {
    return {
      funcs: [
        'Log', 
        'Log10', 
        'log2', 
        'sum', 
        'abs', 
        'round', 
        'year', 
        'month', 
        'day', 
        'date',
        { value: 'IsInscrease', num_params: 1 }
      ],
      vars: [
        { label: 'Price', value: 'price' },
        { label: 'Revenue Per share', value: 'revenue_per_share' },
        { label: 'Revenue', value: 'sales' },
        { label: 'Fees and Other Income', value: 'fees_and_other_income'}
      ],
      symbols: [
        '+', '-', '*', '/', '>', '<', '=', 'AND', 'OR'
      ],

      formula: '',
      usedVars: [],
      usedFuncs: [],
      usedSymbols: []
    }
  },
  mounted () {
    this.getParams = _.debounce(this.getParams, 500)
  },
  methods: {
    async onChange (formula) {
      this.formula = formula
      this.getParams()
    },
    async getParams () {
      this.usedVars = await this.$refs.GfExpression.pluckVars()
      this.usedFuncs = await this.$refs.GfExpression.pluckFuncs()
      this.usedSymbols = await this.$refs.GfExpression.pluckSymbols()
    }
  }
}
</script>

<style>
  #app {
    width: 800px; 
    margin: 100px auto;
  }
</style>
