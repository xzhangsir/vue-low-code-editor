import deepcopy from "deepcopy";
import { ElButton, ElTag } from "element-plus";
import { defineComponent ,computed} from "vue";
import {$tableDialog} from "../components/TableDialog"

export default defineComponent({
  props:{
    propConfig:{type:Object},
    modelValue:{type:Array}
  },
  emits:["update:modelValue"],
  setup(props,ctx){
    // console.log(props)

    const data = computed({
      get(){
        return props.modelValue || []
      },
      set(newValue){
        console.log("newValue",newValue)
        ctx.emit("update:modelValue",deepcopy(newValue))
      }

    })

    const add = ()=>{
        $tableDialog({
          config:props.propConfig,
          data:data.value,
          onConfirm(value){
            // 当点击确认的时候 更新数据
            data.value = value
          }
        })
    }

    return ()=>{
      return <div>
        {/*此下拉框没有数据 显示一个按钮 */}
        {(!data.value || data.value.length === 0)  && <ElButton onClick = {add}>添加</ElButton>}
        {(data.value || []).map(item=><ElTag>{item[props.propConfig.table.key]}</ElTag>)}
      </div>
    }
  }
})