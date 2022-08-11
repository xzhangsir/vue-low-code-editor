import { ElButton, ElInput, ElOption, ElSelect } from "element-plus"
import Range from "../components/Range"

function createEditorConfig(){
  const componentList = []
  const componentMap = {}

  return {
    componentList,
    componentMap,
    register:(component)=>{
      componentList.push(component)
      componentMap[component.key] = component
    }
  }
}
export let registerConfig = createEditorConfig()

const createInputProp = (label)=>({type:"input",label})
const createColorProp = (label)=>({type:"color",label})
const createSelectProp  = (label, options) => ({type: 'select', label, options})
const createTableProp = (label,table)=>({type:"table",label,table})
// console.log(registerConfig);
registerConfig.register({
  label:"下拉框",
  preview:()=><ElSelect modelValue = ""></ElSelect>,
  render:({props ,model})=>{
    return <ElSelect {...model.default}>
      {(props.options || []).map((opt,index)=>{
        return <ElOption label = {opt.label} value = {opt.value} key = {index}></ElOption>
      })}

    </ElSelect>
  },
  key:"select",
  props:{
    options:createTableProp("下拉选型",{
      options:[
        {label:"显示值",field:"label"},
        {label:"绑定值",field:"value"},
      ],
      key:"label" //显示给用户的值
    })
  },
  model:{
    default:"绑定字段"
  }
})


registerConfig.register({
  label:"文本",
  preview:()=> "预览",
  render:({props})=> {
    return <span style = {{color:props.color,fontSize:props.size}}>{props.text || "渲染文本"}</span>
  },
  key:"text",
  props: {
    text: createInputProp('文本内容'),
    color: createColorProp('字体颜色'),
    size: createSelectProp('字体大小', [
      {label: '14px', value: '14px'},
      {label: '24px', value: '24px'},
      {label: '34px', value: '34px'}
    ])
    
  }
})
registerConfig.register({
  label:"按钮",
  resize: {
    width: true,
    height: true
  },
  preview:()=><ElButton>预览按钮</ElButton>,
  render:({props,size})=><ElButton style = {{height:size.height + 'px',width:size.width + 'px'}}  type = {props.type} size = {props.size}>{props.text || "渲染按钮"}</ElButton>,
  key:"button",
  props: {
    text: createInputProp('按钮内容'),
    type: createSelectProp('按钮类型', [
      {label: '基础', value: 'primary'},
      {label: '成功', value: 'success'},
      {label: '警告', value: 'warning'},
      {label: '危险', value: 'danger'},
      {label: '文本', value: 'text'},
    ]),
    size: createSelectProp('按钮尺寸', [
      {label: '默认', value: 'default'},
      {label: '大', value: 'large'},
      {label: '小', value: 'small'},
      {label: '极小', value: 'mini' },
    ])
  }
})

registerConfig.register({
  label:"输入框",
  resize:{
    width:true,  // 宽度可以更改
  },
  preview:()=><ElInput placeholder = "预览"></ElInput>,
  render:({model,size})=><ElInput  style = {{width:size.width + 'px'}} placeholder = "渲染" {...model.default}></ElInput>,
  key:"input",
  model:{
    default:"绑定字段"
  }
})


registerConfig.register({
  label: '范围选择器',
  preview: () => <Range placeholder="预览输入框" />,
  render: ({model}) => {
    return <Range {...{
      start: model.start.modelValue, // @update:start
      end: model.end.modelValue,
      'onUpdate:start': model.start['onUpdate:modelValue'],
      'onUpdate:end': model.end['onUpdate:modelValue'],
    }}/>
  },
  key: 'range',
  model: {
    start: '开始范围字段',
    end: '结束范围字段'
  }
})
