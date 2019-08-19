<template>
  <div>
    <div v-if="funcs.length + vars.length + symbols.length > 0">
      <div v-if="funcs.length > 0" class="tab" :class="{'selected': curTab == 'funcs'}" @click="selectTab('funcs')">
        Functions
      </div>
      <div v-if="symbols.length > 0" class="tab" :class="{'selected': curTab == 'symbols'}" @click="selectTab('symbols')">
        Symbols
      </div>
      <div v-if="vars.length > 0" class="tab" :class="{'selected': curTab == 'vars'}" @click="selectTab('vars')">
        Variables
      </div>
    </div>
    <div v-if="curTab === 'funcs'" class="tags-section">
      <div v-for="func in funcs" :key="func.value" class="tag" @click="selectTag('func-select', func)">
        {{ func.label }}
      </div>
    </div>
    <div v-if="curTab === 'symbols'" class="tags-section">
      <div v-for="symbol in symbols" :key="symbol" class="tag" @click="selectTag('symbol-select', symbol)">
        {{ symbol }}
      </div>
    </div>
    <div v-if="curTab === 'vars'" class="tags-section">
      <div v-for="variable in vars" :key="variable.value" class="tag" @click="selectTag('var-select', variable)">
        {{ variable.label }}
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    funcs: { type: Array, default: () => [] },
    vars: { type: Array, default: () => [] },
    symbols: { type: Array, default: () => ['+', '-', '*', '/'] }
  },
  data () {
    return {
      curTab: ''
    }
  },
  methods: {
    selectTab(tab) {
      if (this.curTab === tab) {
        this.curTab = ''
      } else {
        this.curTab = tab
      }
    },
    selectTag(type, value) {
      this.$emit(type, value)
    }
  }
}
</script>

<style>
  .tab {
    font-size: 13px;
    line-height: 20px;
    display: inline-block;
    padding: 0 4px;
    cursor: pointer;
    border-right: 1px solid #DCDFE6;
    border-top: 1px solid #DCDFE6;
    user-select: none;
  }

  .tab:nth-child(1) {
    border-left: 1px solid #DCDFE6;
  }

  .tab.selected {
    background: #005790;
    color: #FFF;
  }

  .tab.right-float {
    float: right;
    border-left: 1px solid #DCDFE6;
  }

  .tags-section {
    border-right: 1px solid #DCDFE6;
    border-left: 1px solid #DCDFE6;
    border-top: 1px solid #DCDFE6;
    padding: 4px;
  }

  .tag {
    display: inline-block;
    border: 1px solid #E4E7ED;
    font-size: 13px;
    line-height: 20px;
    padding: 0 4px;
    min-width: 20px;
    text-align: center;
  }

  .tag:nth-child(n+1) {
    margin-left: 4px;
    cursor: pointer;
    user-select: none;
  }
</style>
