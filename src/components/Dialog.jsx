
import {ElDialog, ElInput,ElButton} from "element-plus"
import {createVNode, defineComponent,render,reactive} from "vue";

const DialogComponent = defineComponent({
  props:{
    option:{
      type:Object
    }
  },
  setup(props,ctx){
    const state = reactive({
      option:props.option,
      isShow:false
    })

    ctx.expose({//让外界可以调用组件的方法
      showDialog(option){
        state.option = option
        state.isShow = true
      }
    })

    const onCancel = ()=>{
      state.isShow = false
    }

    const onConfirm = ()=>{
      onCancel()
      state.option.onConfirm && state.option.onConfirm(state.option.content)
    }
    
    return ()=>{
      return <ElDialog v-model = {state.isShow}  title = {state.option.title}>
        {{
          default:()=><ElInput 
            type= 'textarea' 
            v-model = {state.option.content}
            rows = {10}
          ></ElInput>,
          footer:()=>state.option.footer &&  <div>
            <ElButton onClick = {onCancel}>取消</ElButton>
            <ElButton type="primary"  onClick = {onConfirm}>确定</ElButton>

          </div>
        }}
      </ElDialog>
    }
  }

})
let vnode;
export function $dialog(option){
  // 如果vnode已经有了 只需要show出来就可以了
  if(!vnode){
    // vue2 中的手动挂载组件 new SubComponent.$mount()
    let el = document.createElement('div')

    
    // 将组件渲染为虚拟节点
    vnode = createVNode(DialogComponent,{option})
    // 最后渲染为真实节点 // 将组件渲染到这个el元素上
    document.body.appendChild((render(vnode,el),el))
  }
  
  let {showDialog} = vnode.component.exposed
  showDialog(option)
  
}