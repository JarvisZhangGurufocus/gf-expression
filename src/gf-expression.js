import Vue from 'vue'
import GfExpression from './components/GfExpression'
import AreaGroup from './components/AreaGroup'
import AreaFunc from './components/AreaFunc'
import AreaInput from './components/AreaInput'
import AreaQuote from './components/AreaQuote'
import AreaSymbol from './components/AreaSymbol'
import AreaVar from './components/AreaVar'

Vue.config.productionTip = false
Vue.component(GfExpression.name, GfExpression)
Vue.component(AreaGroup.name, AreaGroup)
Vue.component(AreaFunc.name, AreaFunc)
Vue.component(AreaInput.name, AreaInput)
Vue.component(AreaQuote.name, AreaQuote)
Vue.component(AreaSymbol.name, AreaSymbol)
Vue.component(AreaVar.name, AreaVar)

export default GfExpression