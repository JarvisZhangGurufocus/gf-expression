<template>
  <div class="gf-exp-editor" @click.self="onClick">
    <area-group 
      ref="AreaGroup"
      :funcs="funcs"
      :vars="vars"
      :symbols="symbols"  
      @on-change="onChange"/>
    <div class="gf-exp-cp-button" @click="onCopy">
      Copy
    </div>
  </div>
</template>

<script>
import AreaGroup from './AreaGroup'

export default {
  components: {
    AreaGroup
  },
  props: {
    funcs: { type: Array, default: () => [] },
    vars: { type: Array, default: () => [] },
    symbols: { type: Array, default: () => ['+', '-', '*', '/', 'AND', 'OR', '>', '<', '='] },
    formula: { type: String, default: '' }
  },
  watch: {
    async formula () {
      const formula = await this.getFormula()
      if (this.formula != formula) {
        this.$refs.AreaGroup.setFormula(this.formula)
      }
    }
  },
  methods: {
    onClick () {
      this.$refs.AreaGroup.requestFocus()
    },
    onChange (e) {
      this.$emit('on-change', e)
    },
    async onCopy() {
      const formula = await this.getFormula()
      navigator.clipboard.writeText(formula).then(() => { this.showMessage('Formula Copied') })
    },
    insertAfterCursor(arr) {
      this.$refs.AreaGroup.insertAfterCursor(arr)
    },
    showMessage(message) {
      if (!document) {
        return
      }
      let messageBox = document.createElement('div')
      messageBox.setAttribute('class', 'gf-expression-message')
      messageBox.textContent = message
      document.body.appendChild(messageBox)
      setTimeout(() => { document.body.removeChild(messageBox) }, 3000)
    },
    pluckFuncs () {
      return this.$refs.AreaGroup.pluckFuncs()
    },
    pluckVars () {
      return this.$refs.AreaGroup.pluckVars()
    },
    pluckSymbols () {
      return this.$refs.AreaGroup.pluckSymbols()
    },
    async getFormula () {
      return await this.$refs.AreaGroup.getFormula()
    }
  }
}
</script>

<style lang="scss">
  .gf-exp-editor {
    border: 1px solid #DCDFE6;
    min-height: 20px;
    padding: 4px 40px 4px 4px;
    position: relative;
  }

  .gf-exp-cp-button {
    position: absolute;
    top: 5px;
    right: 4px;
    font-size: 12px;
    background-color: #fff;
    border: 1px solid #d3d4d6;
    color: #909399;
    padding: 4px;
    cursor: pointer;
  }

  .gf-exp-message {
    position: absolute;
    z-index: 99999;
    min-width: 380px;
    -webkit-box-sizing: border-box;
    box-sizing: border-box;
    border-width: 1px;
    border-style: solid;
    border-color: #EBEEF5;
    color: #606266;
    position: fixed;
    left: 50%;
    top: 20px;
    -webkit-transform: translateX(-50%);
    transform: translateX(-50%);
    background-color: #edf2fc;
    padding: 15px 15px 15px 20px;
    display: -webkit-box;
    display: -ms-flexbox;
    display: flex;
    -webkit-box-align: center;
    -ms-flex-align: center;
    align-items: center;
    border-radius: 4px;
  }
</style>
