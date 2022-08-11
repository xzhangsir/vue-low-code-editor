import { ElButton, ElColorPicker, ElForm, ElFormItem, ElInput, ElInputNumber, ElOption, ElSelect } from "element-plus";
import { defineComponent,inject,watch ,reactive} from "vue";
import deepcopy from "deepcopy"
import TableEditor from "./table-editor";


export default defineComponent({
  props:{
    block:{type:Object},//用户选中的元素
    data:{type:Object}, //当前所有的数据
    updateContainer:{type:Function},
    updateBlock:{type:Function},
  },
  setup(props){
    const config = inject("componentConfig")
    const state = reactive({
      editData:{}
    })
   const reset = ()=>{
      if(!props.block){
        // 没有选中的元素 则绑定的是容器的宽高
        state.editData = deepcopy(props.data.container)

      }else{
        state.editData = deepcopy(props.block);
      }
      // console.log(state.editData);
    }


  const apply = ()=>{
    if(!props.block){
      // 没有选中的元素 更改组件容器的大小
      props.updateContainer({...props.data,container:state.editData})
    }else{
      // 更改组件的配置
      props.updateBlock(state.editData,props.block)
    }

  }

   watch(()=>props.block,reset,{immediate:true})

    return ()=>{
      let content = []
      if(!props.block){
        content.push(<>
           <ElFormItem label = "容器宽度">
              <ElInputNumber v-model = {state.editData.width}></ElInputNumber>
            </ElFormItem>
            <ElFormItem label = "容器高度">
              <ElInputNumber v-model = {state.editData.height}></ElInputNumber>
            </ElFormItem>
        </>)
      }else{

        let component = config.componentMap[props.block.key]

        if(component && component.props){
         
         content.push(Object.entries(component.props).map(([propName,propConfig])=>{
            // console.log(propName,propConfig)
            return <ElFormItem label = {propConfig.label}>
              {{
                "input":()=><ElInput v-model = {state.editData.props[propName]}></ElInput>,
                "color":()=><ElColorPicker v-model = {state.editData.props[propName]}></ElColorPicker>,
                "select":()=><ElSelect v-model = {state.editData.props[propName]}>
                    {
                      propConfig.options.map(opt=>{
                        return <ElOption label = {opt.label} value = {opt.value}></ElOption>
                      })
                    }
                </ElSelect>,
                "table":()=><TableEditor propConfig = {propConfig} v-model={state.editData.props[propName]} ></TableEditor>
              }[propConfig.type]()}
            </ElFormItem>
          }))

        }
     
        if(component && component.model){
          content.push(Object.entries(component.model).map(([modleName,label])=>{
              return <ElFormItem label = {label}>
                <ElInput v-model = {state.editData.model[modleName]}></ElInput>
              </ElFormItem>
          }))
        }
      }

      return <>
        <ElForm labelPosition="top" style = "padding:30px">
          {content}
            <ElFormItem>
              <ElButton type = "primary" onClick = {()=>{apply()}}>应用</ElButton>
              <ElButton onClick = {reset}>重置</ElButton>
            </ElFormItem>
        </ElForm>
      </>
    }
  }
  
})