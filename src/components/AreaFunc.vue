<template>
  <div 
    class="gf-exp-area-func"
    @click.self="requestFocus">
    <span
      @click="requestFocus(true)" 
      :class="{'gf-exp-area-func-focus': focus}">
      {{ func.label }} (
    </span>

    <template v-for="idx in func.num_params">
      <area-group
        :ref="idx - 1"
        :key="`${idx-1}-group`"
        :funcs="funcs"
        :vars="vars"
        :symbols="symbols"
        @on-change="() => emitChange(idx - 1)"
        @on-remove="() => onRemove(idx - 1)"
        @on-move-left="() => onMoveLeft(idx - 1)"
        @on-move-right="() => onMoveRight(idx - 1)"
        @on-focus="() => onFocus(idx - 1)"
        @on-blur="() => onBlur(idx - 1)"/>
      <span
        v-if="idx < func.num_params" 
        :key="`${idx-1}-quote`"> 
        , 
      </span>
    </template>
    <span
      @click="requestFocus(false)" 
      :class="{'gf-exp-area-func-focus': focus}">
      )
    </span>
  </div>
</template>

<script>
import debounce from 'lodash.debounce'

export default {
  name: 'area-func',
  props: {
    funcs: { type: Array, default: () => [] },
    vars: { type: Array, default: () => [] },
    symbols: { type: Array, default: () => ['+', '-', '*', '/', 'AND', 'OR', '>', '<', '='] }
  },
  mounted () {
    this.onFocus = debounce(this.onFocus, 10)
  },
  data () {
    return {
      focus: false,
      lastFocus: -1,
      removeAble: true,
      focusAble: true,
      func: {label: '', num_params: 1}
    }
  },
  methods: {
    onFocus() {
      this.focus = true
      this.$emit('on-focus')
    },
    onBlur (idx) {
      this.focus = false
      this.lastFocus = idx
      this.$emit('on-blur')
    },
    emitChange () {
      this.$emit('on-change', this.getFormula())
    },
    onRemove () {
      this.$emit('on-move-left')
    },
    async onMoveLeft (idx) {
      idx--
      while (idx >= 0) {
        const ref = await this.getRef(idx)
        if (ref && ref.focusAble) {
          await this.callRef(idx, 'requestFocus')
          return
        }
        idx--
      }
      this.$emit('on-move-left')
    },
    async onMoveRight(idx) {
      idx++
      while (idx < this.func.num_params) {
        const ref = await this.getRef(idx)
        if (ref && ref.focusAble) {
          await this.callRef(idx, 'requestFocus')
          return
        }
        idx++
      }
      this.$emit('on-move-right')
    },
    async insertAfterCursor(arr) {
      let idx = this.lastFocus === -1 ? this.func.num_params - 1 : this.lastFocus
      await this.callRef(idx, 'insertAfterCursor', [arr])
    },
    async getContent () {
      let content = ''
      for (let i = 0; i < this.func.num_params; i++) {
        content += await this.callRef(i, 'getContent')
      }
      return content
    },
    async getFormula () {
      let params = []
      for (let i = 0; i < this.func.num_params; i++) {
        const formula = await this.callRef(i, 'getFormula')
        params.push(formula)
      }

      return `${this.func.label}(${params.join()})`
    },
    async setFormula (formula) {
      if (!Array.isArray(formula)) {
        if (typeof formula === 'object') {
          formula = [formula]
        } else {
          return
        }
      }
      if (formula[0]) {
        this.func = formula[0]
        await this.wait(10)
      }
      if (formula[1]) {
        const formulas = formula[1].split(',')
        for (let i = 0; i < formulas.length; i++) {
          await this.callRef(i, 'setFormula', [formulas[i]])
        }
      } 
    },
    async setContent (content) {
      if (!Array.isArray(content)) {
        if (typeof content === 'object') {
          content = [content]
        } else {
          return
        }
      }
      if (content[0]) {
        this.func = content[0]
        await this.wait(10)
      }
      if (content[1]) {
        const contents = content[1].split(',')
        for (let i = 0; i < contents.length; i++) {
          await this.callRef(i, 'setContent', [contents[i]])
        }
      }
    },
    async requestFocus (start=false) {
      if (start) {
        await this.callRef(0, 'requestFocus', [start])
      } else {
        await this.callRef(this.func.num_params - 1, 'requestFocus', [start])
      }
      this.focus = true
    },
    wait(time) {
      return new Promise((resolve) => {
        setTimeout(() => { resolve() }, time)
      })
    },
    async getRef(idx) {
      if (idx > this.func.num_params) {
        return
      }

      const key = idx

      let retry = 0
      while (retry < 5 && ( !this.$refs[key] || this.$refs[key].length === 0 )) {
        await this.wait(10)
        retry++
      }

      if (this.$refs[key] && this.$refs[key][0]) {
        return this.$refs[key][0]
      }

      return this.$refs[key]
    },
    async callRef(idx, func, ...args) {
      const ref = await this.getRef(idx)
      if (!ref) {
        return
      }

      const ret = ref[func].apply(ref, ...args)
      if (Promise.resolve(ret) == ret) {
        return await ret
      }
      return ret
    },
    pluckFuncs () {
      return [this.func] 
    },
    async pluckVars () {
      let result = []
      for (let i = 0; i < this.func.num_params; i++) {
        const paramVars = await this.callRef(i, 'pluckVars')
        if (paramVars) {
          result = result.concat(paramVars)
        }
      }
      return result
    },
    async pluckSymbols () {
      let result = []
      for (let i = 0; i < this.func.num_params; i++) {
        const paramVars = await this.callRef(i, 'pluckSymbols')
        if (paramVars) {
          result = result.concat(paramVars)
        }
      }
      return result
    }
  }
}
</script>

<style lang="scss">
  .gf-exp-area-func {
    display: inline-block;
    padding: 0 4px;
    font-size: 14px;
  }

  .gf-exp-area-func-focus {
    color: #67C23A;
  }
</style>
