<template>
  <div class="area-var" @click="requestFocus">
    {{ variable ? variable.label : '' }}
  </div>
</template>

<script>
export default {
  name: 'area-var',
  data () {
    return {
      removeAble: true,
      focusAble: false,
      variable: {}
    }
  },
  methods: {
    setContent(variable) {
      if (variable) {
        this.variable = variable
      }
    },
    getContent() {
      return this.variable ? this.variable.value : ''
    },
    async getFormula() {
      return this.variable ? `\`${this.variable.value}\`` : ''
    },
    async setFormula(formula) {
      if (formula) {
        this.variable = formula
      }
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
      return [this.variable]
    },
    pluckSymbols () {
      return []
    }
  }
}
</script>

<style>
  .area-var {
    cursor: pointer;
    display: inline-block;
    border: 1px solid;
    background-color: #ecf5ff;
    border-color: #d9ecff;
    color: #409eff;
    padding: 0 4px;
    margin: 0 1px;
    font-size: 11px;
    line-height: 24px;
    height: 24px;
    vertical-align: top;
  }
</style>
