<template>
  <div class="gf-exp-area-group">
    <component
      v-for="(child, idx) in children"
      
      :funcs="funcs"
      :vars="vars"
      :symbols="symbols"

      :key="child.key"
      :is="child.component"
      :ref="child.key"
      
      @on-change="() => emitChange(idx)"
      @on-remove="() => onRemove(idx)"
      @on-replace="(data) => onReplace(idx, data)"
      @on-move-left="() => onMoveLeft(idx)"
      @on-move-right="() => onMoveRight(idx)"
      @on-focus="() => onFocus(idx)"
      @on-blur="() => onBlur(idx)"/>
  </div>
</template>

<script>
import debounce from 'lodash.debounce'
import FormulaHelper from '../utils/FormulaHelper'

export default {
  name: 'area-group',
  props: {
    funcs: { type: Array, default: () => [] },
    vars: { type: Array, default: () => [] },
    symbols: { type: Array, default: () => ['+', '-', '*', '/', 'AND', 'OR', '>', '<', '='] }
  },
  components: {
    AreaInput: () => import('./AreaInput'),
    AreaFunc: () => import('./AreaFunc'),
    AreaVar: () => import('./AreaVar'),
    AreaQuote: () => import('./AreaQuote'),
    AreaSymbol: () => import('./AreaSymbol')
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
      formulaHelper: new FormulaHelper(this.funcs, this.vars, this.symbols),
      children: [
        { component: 'area-input', key: this.randomKey() }
      ]
    }
  },
  methods: {
    onFocus() {
      this.focus = true
      this.$emit('on-focus')
    },
    onBlur(idx) {
      this.focus = false
      this.lastFocus = idx
      this.$emit('on-blur')
    },
    async requestFocus(start = false) {
      if (start === true) {
        await this.callRef(0, 'requestFocus')
      } else {
        await this.callRef(this.children.length - 1, 'requestFocus')
      }
      this.focus = true
    },
    async getContent () {
      let content = ''
      for (let i = 0; i < this.children.length; i++) {
        content += await this.callRef(i, 'getContent') + ' '
      }
      return content.trim()
    },
    async setFormula (formula) {
      const parsed = this.formulaHelper.parse(formula)

      const children = []
      parsed.forEach(item => {
        children.push({ component: item.component, key: this.randomKey() })
      })
      this.children = children

      for (let i = 0; i < parsed.length; i++) {
        await this.callRef(i, 'setFormula', [parsed[i].formula])
      }
      await this.clean()
    },
    async getFormula () {
      let formula = ''
      for (let i = 0; i < this.children.length; i++) {
        formula += await this.callRef(i, 'getFormula') + ' '
      }
      return formula.trim()
    },
    async emitChange () {
      const formula = await this.getFormula()
      this.$emit('on-change', formula)
    },
    async setContent(content) {
      await this.callRef(this.children.length - 1, 'setContent', [content])
    },
    async insertAfterCursor(arr) {
      if (this.lastFocus === -1) {
        await this.onInsert(this.children.length - 1, arr)
        this.emitChange()
      } else if (
        this.children[this.lastFocus].component === 'area-group' || 
        this.children[this.lastFocus].component === 'area-func' ||
        this.children[this.lastFocus].component === 'area-quote'
      ) {
        await this.callRef(this.lastFocus, 'insertAfterCursor', [arr])
      } else {
        await this.onInsert(this.lastFocus, arr)
        this.emitChange()
      }
    },
    async onInsert(idx, arr) {
      for (let i = 0; i < arr.length; i++) {
        this.children.splice(idx + i, 0, { component: arr[i].component, key: this.randomKey() })
      }

      for (let i = 0; i < arr.length; i++) {
        if (arr[i].content !== null) {
          await this.callRef(idx + i, 'setContent', [arr[i].content])
        }
      }

      let focusIdx = arr.findIndex(item => item.focus)
      focusIdx = focusIdx === -1 ? idx + arr.length - 1 : idx + focusIdx
      await this.callRef(focusIdx, 'requestFocus')
      await this.clean()
    },
    async onReplace(idx, arr) {
      this.children.splice(idx, 1)
      for (let i = 0; i < arr.length; i++) {
        this.children.splice(idx + i, 0, { component: arr[i].component, key: this.randomKey() })
      }

      for (let i = 0; i < arr.length; i++) {
        if (arr[i].content !== null && arr[i].content !== undefined) {
          await this.callRef(idx + i, 'setContent', [arr[i].content])
        }

        if (arr[i].formula !== null && arr[i].formula !== undefined) {
          await this.callRef(idx + i, 'setFormula', [arr[i].formula])
        }

        if (arr[i].focus === true) {
          await this.callRef(idx + i, 'requestFocus', [true])
        }
      }
      await this.clean()
      this.emitChange()
    },
    async onMoveLeft(idx) {
      idx--
      while (idx >= 0) {
        const ref = await this.getRef(idx)
        if (ref.focusAble) {
          await this.callRef(idx, 'requestFocus')
          return
        }
        idx--
      }
      this.$emit('on-move-left')
    },
    async onMoveRight(idx) {
      idx++
      while (idx < this.children.length) {
        const ref = await this.getRef(idx)
        if (ref.focusAble) {
          await this.callRef(idx, 'requestFocus', [true])
          return
        }
        idx++
      }
      this.$emit('on-move-right')
    },
    async onRemove(idx) {
      if (idx === 0 && this.children.length === 1) {
        this.$emit('on-remove')
      } else {
        idx = Math.max(idx - 1, 0)
        this.children.splice(idx, 1)
        await this.clean()
        await this.callRef(idx, 'requestFocus', [false])
        this.emitChange()
      }
    },
    async clean() {
      for (let i = 1; i < this.children.length; i++) {
        if ( this.children[i].component === 'area-input' && this.children[i-1].component === 'area-input' ) {
          let ref1 = await this.getRef(i-1)
          let ref2 = await this.getRef(i)
          let content1 = await this.callRef(i-1, 'getContent')
          let content2 = await this.callRef(i, 'getContent')
          let focus = ref1.focus || ref2.focus

          this.children.splice(i, 1)

          if (content2) {
            await this.callRef(i-1, 'setContent', [content1 + ' ' + content2])
          }

          if (focus) {
            await this.callRef(i-1, 'requestFocus')
          }
          i--
        }
      }

      for (let i = 1; i < this.children.length; i++) {
        if (this.children[i].component !== 'area-input' && this.children[i - 1].component !== 'area-input') {
          this.children.splice(i, 0, { component: 'area-input',  key: this.randomKey() })
        }
      }

      if (this.children.length === 0) {
        this.children.push({ component: 'area-input', key: this.randomKey() })
      }

      if (this.children[this.children.length - 1].component !== 'area-input') {
        this.children.push({ component: 'area-input', key: this.randomKey() })
      }

      if (this.children[0].component !== 'area-input') {
        this.children.unshift({ component: 'area-input', key: this.randomKey() })
      }

      for (let i = 0; i < this.children.length; i++) {
        const ref = await this.getRef(i)
        if (ref && ref.focus) {
          return
        }
      }
      await this.callRef(this.children.length - 1, 'requestFocus')
    },
    async getRef(idx) {
      if (idx >= this.children.length) {
        return
      }

      const child = this.children[idx]
      const key = child.key
      
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
    async pluckFuncs () {
      let result = []
      for (let i = 0; i < this.children.length; i++) {
        const paramVars = await this.callRef(i, 'pluckFuncs')
        if (paramVars) {
          result = result.concat(paramVars)
        }
      }
      return result
    },
    async pluckVars () {
      let result = []
      for (let i = 0; i < this.children.length; i++) {
        const paramVars = await this.callRef(i, 'pluckVars')
        if (paramVars) {
          result = result.concat(paramVars)
        }
      }
      return result
    },
    async pluckSymbols () {
      let result = []
      for (let i = 0; i < this.children.length; i++) {
        const paramVars = await this.callRef(i, 'pluckSymbols')
        if (paramVars) {
          result = result.concat(paramVars)
        }
      }
      return result
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
    wait(time) {
      return new Promise((resolve) => {
        setTimeout(() => { resolve() }, time)
      })
    },
    randomKey() {
      return Math.random().toString(36).substring(2, 15)
    }
  }
}
</script>

<style>
  .gf-exp-area-group {
    display: inline-block;
  }
</style>
