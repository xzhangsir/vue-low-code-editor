import {defineComponent,computed,inject,ref} from "vue"
import { DArrowLeft, DArrowRight, Download, Upload, SortDown, SortUp, Delete, View, Hide, CloseBold } from '@element-plus/icons-vue'
import "./editor.scss"
import EditorBlock from "./editor-block"
import deepcopy from "deepcopy"
import { useMenuDragger } from "./useMenuDragger"
import {useFocus} from "./useFocus"
import {useBlockDragger} from "./useBlockDragger"
import { useCommand } from "./useCommand"
import { $dialog } from "../components/Dialog"
import { $dropdown,DropdownItem } from "../components/Dropdown"
import EditorOperator from "./editor-operator"

export default defineComponent({
  props:{
    modelValue:{type:Object},
    formData:{type:Object},
  },
  emits: ['update:modelValue'], //要触发的事件
  setup(props,ctx){
    const previewRef = ref(false)
    const editorRef = ref(true)

    
    const config = computed({
      get(){
        // console.log("1",props.modelValue)
        return props.modelValue
      },
      set(newVal){
        // console.log(newVal);
         ctx.emit('update:modelValue', deepcopy(newVal))
      }
    })

    const containerStyles = computed(()=>({
      width:config.value.container.width + 'px',
      height:config.value.container.height + 'px',
    }))

   
    const componentConfig = inject("componentConfig")
    // console.log(componentConfig)
    const containerRef = ref(null) //需要拖拽到的内容区域
    //1. 实现菜单的拖拽
    const {dragstart,dragend} = useMenuDragger(containerRef,config)
    // 2. 实现获取焦点
    
    const {lastSelectBlock,containerMousedown,blockMousedown, focusData ,clearBlockFocus} = useFocus(config,previewRef,(e)=>{
      // 获取焦点后 进行拖拽
        mousedown(e)
    })
    // 3 实现拖拽多个元素
     // 内容区组件拖拽
    const {mousedown,markLine} = useBlockDragger(focusData,lastSelectBlock,config)

   
    

    // console.log(markLine);

    // 撤销&重做
    const {commands} = useCommand(config, focusData)
    const buttons = [
      { label: '撤销', icon: <DArrowLeft />, handler: () => commands.undo()},
      { label: '重做', icon: <DArrowRight />, handler: () => commands.redo() },
      { label: '导出', icon: <Download />, handler: () => {
        $dialog({
          title:"导出JSON",
          content:JSON.stringify(config.value),
          footer:false,
         
        })
      } },
      { label: '导入', icon: <Upload />, handler: () => {
        $dialog({
          title:"导入JSON",
          content:"",
          footer:true,
          onConfirm(text){
            // config.value = JSON.parse(text) //这样无法撤销

            commands.updateContainer(JSON.parse(text))

          }
        })
      }  },
      { label: '置顶', icon: <SortUp />, handler: () => commands.placeTop() },
      { label: '置底', icon: <SortDown />, handler: () => commands.placeBottom() },
      { label: '删除', icon: <Delete />, handler: () => commands.delete() },
      { label: ()=>(previewRef.value ? "编辑" : "预览"), icon:()=>previewRef.value ? <View /> : <Hide/>, handler: () => {
        previewRef.value = !previewRef.value
        clearBlockFocus()
      } },
      { label: '关闭', icon: <CloseBold />, handler: () => {
        editorRef.value = false
        clearBlockFocus()
      } },

    ]

     const onContextMenuBlock = (e, block) => {
       e.preventDefault()
       $dropdown({
        el: e.target, // 以哪个元素为准产生一个dropdown
         content: () => {
          return <>
            <DropdownItem label="删除" icon={<Delete style="width: 1rem" />} onClick={() => commands.delete()} />
            <DropdownItem label="置顶" icon={<SortUp style="width: 1rem" />} onClick={() => commands.placeTop()} />
            <DropdownItem label="置底" icon={<SortDown style="width: 1rem" />} onClick={() => commands.placeBottom()} />
            <DropdownItem label="查看" icon={<View style="width: 1rem" />} onClick={() => {
              $dialog({
                title: '查看节点数据',
                content: JSON.stringify(block)
              })
            }} />
            <DropdownItem label="导入" icon={<Download style="width: 1rem" />} onClick={() => {
              $dialog({
                title: '导入节点数据',
                content: '',
                footer: true,
                onConfirm(text) {
                  commands.updateBlock(JSON.parse(text), block)
                }
              })
            }} />
          </>
         }
       })

     }
 

    return ()=>
    !editorRef.value ?
    <>
       <div className="editor-container-canvas">
          {/* 内容区 */}
            <div 
              className="editor-container-canvas-content" 
              style = {containerStyles.value}
            >
              {
                (config.value.blocks.map((block,index)=>(
                  <EditorBlock 
                    block = {block}
                    class = "editor-block-preview"
                    formData = {props.formData}
                  />
                )))
              }
            </div>
        </div>
        <el-button type="primary" onClick={() => editorRef.value = true}>继续编辑</el-button>
        {JSON.stringify(props.formData)}
    </>
    : 
    <>
      <div class = "editor">
        <div className="editor-left">
          {/* 根据注册 列表 渲染对应的内容*/}
          {
            componentConfig.componentList.map(com=>(
              <div 
                  className="editor-left-item"
                  draggable
                  onDragstart = {e => dragstart(e,com)}
                  onDragend = {dragend}
                  > 
                  <span>{com.label}</span>
                  <div>{com.preview()}</div>
              </div>
            ))
          }
        </div>
        <div className="editor-top">
          <el-button-group>
            {buttons.map((btn,index)=>{
              const icon = typeof btn.icon === 'function'
              return <el-button type="primary" icon={icon ? btn.icon() : btn.icon} key={index} onClick={btn.handler}>
                  <span>{icon ? btn.label() : btn.label}</span>
                </el-button>
            })}
          </el-button-group>
        </div>
        <div className="editor-right">
          <EditorOperator 
            block = {lastSelectBlock.value} 
            data = {config.value}
            updateContainer={commands.updateContainer}
            updateBlock = {commands.updateBlock}
          ></EditorOperator>
        </div>
        <div className="editor-container">
          {/* 负责产生滚动条 */}
          <div className="editor-container-canvas">
          {/* 内容区 */}
            <div 
              className="editor-container-canvas-content" 
              style = {containerStyles.value}
              ref = {containerRef}
              onMousedown = {containerMousedown}
            >
              {
                (config.value.blocks.map((block,index)=>(
                  <EditorBlock 
                    block = {block}
                    class = {block.focus ? "editor-block-focus" : previewRef.value ? "editor-block-preview" : ""}
                    onMousedown={(e)=>{blockMousedown(e,block,index)}}
                    onContextmenu={(e) => onContextMenuBlock(e, block)}
                    formData = {props.formData}
                  />
                )))
              }
              {
                markLine.x != null && <div className="line-x" style = {{left:markLine.x  + 'px'}}></div>
              }
              {
                markLine.y != null && <div className="line-y" style = {{top:markLine.y + 'px'}}></div>
              }
            </div>


          

          </div>
        </div>
      </div>
    </>
  }
})