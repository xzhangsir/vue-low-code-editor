import { defineComponent } from "vue";

export default defineComponent({
  props:{
    block:{type:Object},
    component:{type:Object}
  },
  setup(props){
    const {width, height} = props.component.resize || {}

    let obj = {
      'left': { horizontal: 'start', vertical: 'center' },
      'right': { horizontal: 'end', vertical: 'center' },
      'top': { horizontal: 'center', vertical: 'start' },
      'bottom': { horizontal: 'center', vertical: 'end' },

      'top-left': { horizontal: 'start', vertical: 'start' },
      'top-right': { horizontal: 'end', vertical: 'start' },
      'bottom-left': { horizontal: 'start', vertical: 'end' },
      'bottom-right': { horizontal: 'end', vertical: 'end' }
    },
    data = {}
    const onmousemove = (e) => {
      let {clientX, clientY} = e,
        {startX, startY, startWidth, startHeight,startLeft, startTop, direction} = data
      
      if(direction.horizontal === 'center') { // 如果拖拽的是 中间的点x轴不变
        clientX = startX
      }
      if(direction.vertical === 'center') { // 只能改横向 纵向是不发生变化
        clientY = startY
      }

      let durX = clientX - startX,
        durY = clientY - startY

      if(direction.vertical === 'start') { // 反向拖拽的点，需要取反
        durY = -durY
        props.block.top = startTop - durY
      }
      if(direction.horizontal === 'start') {
        durX = -durX
        props.block.left = startLeft - durX
      }
      
      const width = startWidth + durX,
       height = startHeight + durY
      
       props.block.width = width
       props.block.height = height
       props.block.hasResize = true
    }
    const onmousedown = (e) => {
      e.stopPropagation()
      let key = e.target.className.split(' ')[1].slice(13)
      data = {
        startX: e.clientX,
        startY: e.clientY,
        startWidth: props.block.width,
        startHeight: props.block.height,
        startLeft: props.block.left,
        startTop: props.block.top,
        direction: obj[key]
      }
      document.body.addEventListener('mousemove', onmousemove)
      document.body.addEventListener('mouseup', onmouseup)
    }
    const onmouseup = () => {
      document.body.removeEventListener('mousemove', onmousemove)
      document.body.removeEventListener('mouseup', onmouseup)
    }
    // console.log( props.component.resize || {})
    // const {width,height} = props.component.resize || {}
    return ()=>{
      return <div  onMousedown={e => onmousedown(e)}>
         {width && <>
          <div class="block-resize block-resize-left"/>
          <div class="block-resize block-resize-right"></div>
        </>}
        {height && <>
          <div class="block-resize block-resize-top"></div>
          <div class="block-resize block-resize-bottom"></div>
        </>}
        {width && height && <>
          <div class="block-resize block-resize-top-left"></div>
          <div class="block-resize block-resize-top-right"></div>
          <div class="block-resize block-resize-bottom-left"></div>
          <div class="block-resize block-resize-bottom-right"></div>
        </>}

      </div>
    }
  }
})