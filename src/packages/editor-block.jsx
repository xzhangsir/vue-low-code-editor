import {defineComponent,computed,inject,ref,onMounted} from "vue"
import BlockResize from "./block-resize"


export default defineComponent({
  props:{
    block:{type:Object},
    formData:{type:Object},
  },
  setup(props){
    // console.log("props",props)
    
    const  blockStyles = computed(()=>(
      {
      top:`${props.block.top}px`,
      left:`${props.block.left}px`,
      zIndex:`${props.block.zIndex}`
      }
    ))

    const config = inject("componentConfig")
    
    const blockRef = ref(null)

    onMounted(()=>{
      let {offsetWidth,offsetHeight} = blockRef.value
      if(props.block.aligenCenter){
        // 说明是拖拽松手的时候 才渲染的  其他渲染到页面上的内容不要居中
        props.block.left = props.block.left - offsetWidth/2
        props.block.top = props.block.top - offsetHeight/2
        props.block.aligenCenter = false
      }
      props.block.width = offsetWidth
      props.block.height = offsetHeight
    })

    // console.log(config);
    return ()=>{
      const component = config.componentMap[props.block.key]
      // console.log('component',component,props.block)
      const RenderComponent = component.render({
        size:props.block.hasResize ? {width:props.block.width,height:props.block.height} : {},
        props:props.block.props,
        model:Object.keys(component.model || {}).reduce((prev,modelName)=>{
          let propName = props.block.model[modelName]
          prev[modelName] = {
            modelValue:props.formData[propName],
            "onUpdate:modelValue":v=>props.formData[propName] = v
          }
          return prev
        },{})
      })
      const {width,height} = component.resize || {}
      // console.log(props.block.focus,width,height)
      return <div 
                class = "editor-block"  
                style={blockStyles.value}
                ref = {blockRef}
              >
                {RenderComponent}
                <div>{props.block.focus}</div>

                {/* 传递block的目的是为了修改宽高 */}
                {/* component中存放了 是修改高度还是宽度 */}
                {props.block.focus && (width || height) && <BlockResize 
                  block = {props.block} 
                  component = {component}
                />}



              </div>
    }
  }
})