<template>
  <div class="area-symbol" @click="requestFocus">
    {{ symbol }}
  </div>
</template>

<script>
export default {
  name: 'area-symbol',
  data () {
    return {
      symbol: '',
      focusAble: false,
      removeAble: true
    }
  },
  methods: {
    getContent() {
      return this.symbol
    },
    async getFormula () {
      return this.symbol
    },
    async setFormula (formula) {
      this.symbol = formula
    },
    setContent(symbol) {
      this.symbol = symbol
    },
    async requestFocus(start=false) {
      if (start === true) {
        this.$emit('on-move-left')
      } else {
        this.$emit('on-move-right')
      }
    },
    pluckFuncs () {
      return []
    },
    pluckVars () {
      return []
    },
    pluckSymbols () {
      return [this.symbol]
    },
  }
}
</script>

<style>
  .area-symbol {
    cursor: pointer;
    display: inline-block;
    border: 1px solid;
    background-color: #f0f9eb;
    border-color: #e1f3d8;
    color: #67c23a;
    padding: 0 4px;
    margin: 0 1px;
    font-size: 11px;
    line-height: 24px;
    height: 24px;
    vertical-align: top;
  }
</style>
