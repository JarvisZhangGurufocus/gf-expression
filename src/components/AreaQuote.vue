<template>
  <div 
    class="gf-exp-area-quote"
    @click.self="requestFocus">
    <span
      @click="requestFocus(true)"
      :class="{'gf-exp-area-quote-focus': focus}"> 
      ( 
    </span>
    <area-group
      ref="AreaGroup"
      :funcs="funcs"
      :vars="vars"
      :symbols="symbols"
      
      @on-change="() => { $emit('on-change') }"
      @on-remove="() => { $emit('on-move-left') }"
      @on-move-left="() => { $emit('on-move-left') }"
      @on-move-right="() => { $emit('on-move-right') }"
      @on-focus="onFocus"
      @on-blur="onBlur"/>
    <span
      @click="requestFocus(false)" 
      :class="{'gf-exp-area-quote-focus': focus}"> 
      ) 
    </span>
  </div>
</template>

<script>
export default {
  name: 'area-quote',
  props: {
    funcs: { type: Array, default: () => [] },
    vars: { type: Array, default: () => [] },
    symbols: { type: Array, default: () => ['+', '-', '*', '/', 'AND', 'OR', '>', '<', '='] }
  },
  data () {
    return {
      focus: false,
      removeAble: true,
      focusAble: true
    }
  },
  methods: {
    onFocus () {
      this.focus = true
      this.$emit('on-focus')
    },
    onBlur() {
      this.focus = false
      this.$emit('on-blur')
    },
    getContent () {
      return this.$refs.AreaGroup.getContent()
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
    insertAfterCursor(arr) {
      this.$refs.AreaGroup.insertAfterCursor(arr)
    },
    setContent (content) {
      this.$refs.AreaGroup.setContent(content)
    },
    setFormula (formula) {
      this.$refs.AreaGroup.setFormula(formula)
    },
    requestFocus (start=false) {
      this.$refs.AreaGroup.requestFocus(start)
      this.focus = true
    },
    async getFormula () {
      const formula = await this.$refs.AreaGroup.getFormula()
      return `( ${formula} )`
    }
  }
}
</script>

<style>
  .gf-exp-area-quote {
    display: inline-block;
  }

  .gf-exp-area-quote-focus {
    color: #67C23A;
  }
</style>
