<template>
  <div 
    class="area-input"
    :class="{'focus':focus}">
    
    <div 
      class="area-input-inner" 
      contenteditable="true"
      @keydown="onKeyDown"
      @paste="onPaste"
      @focus="() => { focus = true; $emit('on-focus') }"
      @blur="() => { focus = false; $emit('on-blur') }"/>
    
    <div
      v-if="focus && matchs && matchs.length > 0"
      class="area-input-drop-down">
      <template v-for="(item, idx) in matchs">
        <div 
          v-if="item.component === 'area-symbol'" 
          class="item symbol-item"
          :class="{'selected': idx === matchs_idx}"
          :key="`SYMBOL${idx}`"
          @mousedown="handleMatch(item)">
          {{ item.item }}
        </div>
        <div 
          v-else-if="item.component === 'area-var'"
          class="item var-item"
          :class="{'selected': idx === matchs_idx}"
          :key="`VAR${idx}`"
          @mousedown="handleMatch(item)">
          {{ item.item.label }}
        </div>
        <div 
          v-else-if="item.component === 'area-func'"
          class="item func-item"
          :class="{'selected': idx === matchs_idx}"
          :key="`FUNC${idx}`"
          @mousedown="handleMatch(item)">
          {{ item.item.label }}
        </div>
      </template>
    </div>

  </div>
</template>

<script>
import debounce from 'lodash.debounce'
import FormulaHelper from '../utils/FormulaHelper'

export default {
  name: 'area-input',
  props: {
    funcs: { type: Array, default: () => [] },
    vars: { type: Array, default: () => [] },
    symbols: { type: Array, default: () => ['+', '-', '*', '/', 'AND', 'OR', '>', '<', '='] }
  },
  mounted () {
    this.handleSymbol = debounce(this.handleSymbol, 10)
    this.handleLeftQuote = debounce(this.handleLeftQuote, 10)
    this.handleRightQuote = debounce(this.handleRightQuote, 10)
  },
  data () {
    return {
      focus: false,
      focusAble: true,
      removeAble: false,
      formulaHelper: new FormulaHelper(this.funcs, this.vars, this.symbols),
      matchTimer: null,
      matchs: [],
      matchs_idx: 0
    }
  },
  methods: {
    getContent () {
      return this.$el.querySelector('.area-input-inner').textContent ? this.$el.querySelector('.area-input-inner').textContent : ''
    },
    async getFormula () {
      return this.$el.querySelector('.area-input-inner').textContent ? this.$el.querySelector('.area-input-inner').textContent : ''
    },
    setContent (content) {
      this.$el.querySelector('.area-input-inner').textContent = content
    },
    pluckFuncs () {
      return []
    },
    pluckVars () {
      return []
    },
    pluckSymbols () {
      return []
    },
    async setFormula (formula) {
      if (typeof formula != 'string') {
        return
      }
      this.setContent(formula)
    },
    async requestFocus (start = false) {
      if (!this.getContent()) {
        return this.$el.querySelector('.area-input-inner').focus()
      }

      let length = 0
      if (start !== true) {
        length = this.getContent().length
      }

      const node = this.$el.querySelector('.area-input-inner').childNodes[0]
      const range = document.createRange()
      range.setStart(node, length)
      range.setEnd(node, length)

      const sel = window.getSelection()
      sel.removeAllRanges()
      sel.addRange(range)

      this.focus = true
    },
    onPaste (e) {
      const clipboardData = e.clipboardData || window.clipboardData
      const pastedData = clipboardData.getData('Text').replace(/(\r\n|\n|\r)/gm, '')
      const parsed = this.formulaHelper.parse(pastedData)
      this.$emit('on-replace', parsed)
      e.preventDefault()
    },
    onKeyDown(e) {
      switch (e.key) {
        case '(':
          this.handleLeftQuote()
        break
        case ')':
          this.handleRightQuote()
        break
        case 'ArrowRight':
          this.handleArrowRight()
        break
        case 'ArrowLeft':
          this.handleArrowLeft()
        break
        case 'ArrowDown':
          if (this.matchs_idx < this.matchs.length - 1) {
            this.matchs_idx++
          }
          e.preventDefault()
        break
        case 'ArrowUp':
          if (this.matchs_idx > 0) {
            this.matchs_idx--
          }
          e.preventDefault()
        break
        case 'Enter':
          if (this.matchs.length > 0 && this.matchs[this.matchs_idx]) {
            this.handleMatch(this.matchs[this.matchs_idx])
          }
          e.preventDefault()
        break
        case 'Backspace':
          this.handleBackspace()
          this.findMatchs()
        break
        default:
          if (this.symbols.indexOf(e.key) > -1) {
            this.handleSymbol(e.key)
          }
          this.findMatchs()
      }
    },
    handleLeftQuote() {
      const content = this.getContent()
      const index = content.indexOf('(')
      const pieces = [
        { component: 'area-quote', focus: true, content: content.substring(index + 1).trim() },
        { component: 'area-input', focus: false, content: '' }
      ]
      if (content.substring(0, index).trim()) {
        pieces.unshift({ component: 'area-input', focus: false, content: content.substring(0, index).trim() })
      }
      this.$emit('on-replace', pieces)
    },
    handleRightQuote() {
      const content = this.getContent()
      const index = content.indexOf(')')
      const pieces = [
        { component: 'area-quote', focus: true, content: content.substring(0, index).trim() },
        { component: 'area-input', focus: false, content: content.substring(index + 1).trim() }
      ]
      this.$emit('on-replace', pieces)
    },
    handleArrowRight() {
      const sel = window.getSelection()
      const content = this.getContent().trim()
      if (!content || sel.focusOffset === content.length) {
        this.$emit('on-move-right')
      }
    },
    handleArrowLeft() {
      const sel = window.getSelection()
      if (sel.focusOffset === 0) {
        this.$emit('on-move-left')
      }
      if (sel.focusOffset === 1 && !sel.focusNode.data.charAt(0).trim()) {
        this.$emit('on-move-left')
      }
    },
    handleBackspace() {
      const sel = window.getSelection()
      if (sel.focusOffset === 0) {
        this.$emit('on-remove')
      }
    },
    handleSymbol(symbol) {
      const content = this.getContent()
      const index = content.toUpperCase().indexOf(symbol.toUpperCase())

      const pieces = [
        { component: 'area-input', focus: false, content: content.substring(0, index).trim() },
        { component: 'area-symbol', focus: false, content: symbol },
        { component: 'area-input', focus: true, content: content.substring(index + symbol.length + 1).trim() }
      ]
      this.$emit('on-replace', pieces)
    },
    handleVar(match) {
      const content = this.getContent()
      const sel = window.getSelection()
      const pieces = [
        { component: 'area-input', focus: sel.focusOffset < match.start, content: content.substring(0, match.start).trim() },
        { component: 'area-var', focus: false, content: match.item },
        { component: 'area-input', focus: sel.focusOffset >= match.start, content: content.substring(match.end+1).trim() }
      ]
      this.$emit('on-replace', pieces)
    },
    handleFunc(match) {
      const content = this.getContent()
      const sel = window.getSelection()
      const pieces = [
        { component: 'area-input', focus: sel.focusOffset < match.start, content: content.substring(0, match.start).trim() },
        { component: 'area-func', focus: sel.focusOffset >= match.start, content: [match.item, content.substring(match.end+1).trim()] },
        { component: 'area-input', focus: false, content: '' },
      ]
      this.$emit('on-replace', pieces)
    },
    handleMatch(match) {
      switch (match.component) {
        case 'area-var':
          this.handleVar(match)
          break
        case 'area-func':
          this.handleFunc(match)
          break
        case 'area-symbol':
          this.handleSymbol(match.item)
          break
      }
    },
    findMatchs () {
      clearTimeout(this.matchTimer)
      this.matchTimer = setTimeout(() => {
        this.doFindMatchs()
      }, 300)
    },
    doFindMatchs() {
      const matchs = []
      const content = this.getContent()

      for (let end = 0; end < content.length; end++) {
        for (let start = 0; start <= end; start++) {
          if (end - start < 1) {
            continue
          }

          const piece = content.substring(start, end + 1)
          this.vars.forEach(item => {
            const key1 = item.label.toUpperCase()
            const key2 = item.value.toUpperCase()
            const key3 = piece.toUpperCase()
            let match = null
            
            if (key1 === key3 || key2 === key3) {
              match = {item: item, start: start, end: end, component: 'area-var', piece: key3, exactMatch: true}
            } else if (key1.startsWith(key3) || key2.startsWith(key3)) {
              match = {item: item, start: start, end: end, component: 'area-var', piece: key3, exactMatch: false}
            }

            if (match) {
              const matchedIdx = matchs.findIndex(item => item.item === match.item)
              if (matchedIdx > -1 && (match.exactMatch || match.piece.length > matchs[matchedIdx].piece.length)) {
                matchs.splice(matchedIdx, 1, match)
              } else {
                matchs.push(match)
              }
            }
          })

          this.funcs.forEach(item => {
            const key1 = item.label.toUpperCase()
            const key2 = item.value.toUpperCase()
            const key3 = piece.toUpperCase()
            let match = null

            if (key1 === key3 || key2 === key3) {
              match = {item: item, start: start, end: end, component: 'area-func', piece: key3, exactMatch: true}
            } else if ( key1.startsWith(key3) || key2.startsWith(key3) ) {
              match = {item: item, start: start, end: end, component: 'area-func', piece: key3, exactMatch: false}
            }

            if (match) {
              const matchedIdx = matchs.findIndex(item => item.item === match.item)
              if (matchedIdx > -1 && (match.exactMatch || match.piece.length > matchs[matchedIdx].piece.length)) {
                matchs.splice(matchedIdx, 1, match)
              } else {
                matchs.push(match)
              }
            }
          })

          this.symbols.forEach(item => {
            const key1 = item.toUpperCase()
            const key2 = piece.toUpperCase()
            let match = null

            if (key1 === key2) {
              match = {item: item, start: start, end: end, component: 'area-symbol', piece: key2, exactMatch: true}
            } else if (key1.startsWith(key2)) {
              match = {item: item, start: start, end: end, component: 'area-symbol', piece: key2, exactMatch: false}
            }

            if (match) {
              const matchedIdx = matchs.findIndex(item => item.item === match.item)
              if (matchedIdx > -1 && (match.exactMatch || match.piece.length > matchs[matchedIdx].piece.length)) {
                matchs.splice(matchedIdx, 1, match)
              } else {
                matchs.push(match)
              }
            }
          })
        }
      }

      matchs.sort((a, b) => {
        if (a.exactMatch != b.exactMatch) {
          return a.exactMatch ? -1 : 1
        }
        return b.piece.length - a.piece.length
      }).splice(10, matchs.length - 10)

      this.matchs = matchs
      this.matchs_idx = 0
    }
  }
}
</script>

<style lang="scss">
  .area-input-inner {
    min-width: 4px;
    height: 24px;
    line-height: 24px;

    &:focus{
      outline: none;
    }
  }

  .area-input {
    position: relative;
    border: 1px dashed;
    border-color: transparent;
    display: inline-block;
    padding: 0 2px;

    &.focus {
      border-color: #E4E7ED;
    }
  }

  .area-input-drop-down {
    position: absolute;
    border-radius: 4px;
    border: 1px solid #ebeef5;
    background: #FFF;
    box-shadow: 0 2px 12px 0 rgba(0,0,0,.1);
    font-size: 12px;
    padding: 4px;
    margin: 4px 0;
    left: 50%;
    white-space: nowrap;

    .item {
      padding: 0 4px;
      line-height: 20px;
    }

    .symbol-item::after {
      content: 'Symbol';
      font-size: 11px;
      border: 1px solid #E1F3D8;
      background: #F0F9EB;
      color: #67C23A;
      padding: 0 4px;
      margin-left: 8px;
    }

    .var-item::after {
      content: 'Symbol';
      font-size: 11px;
      border: 1px solid #D9ECFF;
      background: #ECF5FF;
      color: #409EFF;
      padding: 0 4px;
      margin-left: 8px;
    }

    .func-item::after {
      content: 'Function';
      font-size: 11px;
      background: #f4f4f5;
      border: 1px solid #e9e9eb;
      color: #909399;
      padding: 0 4px;
      margin-left: 8px;
    }

    .selected {
      background: #DCDFE6;
    }
  }
</style>
