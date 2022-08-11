import {provide,inject,createVNode, defineComponent,ref,onBeforeUnmount,onMounted,render,reactive,computed} from "vue";

export const DropdownItem = defineComponent({
  props: {
    label: String,
    icon: String
  },
  setup(props) {
    let hide = inject('hide')
    return () => <div class="dropdown-item"  onClick={hide}>
      {props.icon}
      <span>{props.label}</span>
    </div>
  }
})



const DropdownComponent = defineComponent({
  props:{
    option:{
      type:Object
    }
  },
  setup(props,ctx){
    const state = reactive({
      option:props.option,
      isShow:false,
      top: 0,
      left: 0
    })

    ctx.expose({//让外界可以调用组件的方法
      showDropdown(option){
        state.option = option
        state.isShow = true
        let {top, left, height} = option.el.getBoundingClientRect()
        state.top = top + height
        state.left = left
      }
    })
    provide('hide', () => state.isShow = false)


    const classes = computed(() => [
      'dropdown',
      {
        'dropdown-isShow': state.isShow
      }
    ])
    const styles = computed(() => ({
      top: state.top+'px',
      left: state.left+'px',
      zIndex: 10000
    }))
    const el = ref(null)
    const onmousedownDocument = (e) => {
      if(!el.value.contains(e.target)) { // 如果点击的是dropdown内部 什么都不做
        state.isShow = false
      }
    }
    onMounted(() => {
      // 事件的传递行为 先捕获再冒泡
      // 之前为了阻止事件传播 给block 都增加了stopPropagation
      document.body.addEventListener('mousedown', onmousedownDocument ,true)
    })
    onBeforeUnmount(() => {
      document.body.removeEventListener('mousedown', onmousedownDocument)
    })

    
  return ()=>{
            return <div class={classes.value} style={styles.value} ref={el}>
                {state.option.content()}
            </div>
        }

  }

})

let vnode;
export function $dropdown(option){
 // 如果vnode已经有了 只需要show出来就可以了
  if(!vnode){
    // vue2 中的手动挂载组件 new SubComponent.$mount()
    let el = document.createElement('div')

    
    // 将组件渲染为虚拟节点
    vnode = createVNode(DropdownComponent,{option})
    // 最后渲染为真实节点 // 将组件渲染到这个el元素上
    document.body.appendChild((render(vnode,el),el))
  }
  
  let {showDropdown} = vnode.component.exposed
  showDropdown(option)
  
}