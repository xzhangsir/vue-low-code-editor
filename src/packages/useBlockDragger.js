import { reactive } from 'vue'
import { events } from './event'

export function useBlockDragger(focusData, lastSelectBlock, config) {
  let dragState = {
    startX: 0,
    startY: 0,
    dragging: false //当前是否正在拖拽
  }
  let markLine = reactive({
    x: null,
    y: null
  })
  const mousemove = (e) => {
    let { clientX: moveX, clientY: moveY } = e
    if (!dragState.dragging) {
      dragState.dragging = true
      events.emit('start')
    }
    // 辅助线
    // 计算当前元素最新的left和top  去线里面找  找到显示线
    let left = moveX - dragState.startX + dragState.startLeft
    let top = moveY - dragState.startY + dragState.startTop

    // 先计算横向 辅助线
    let y = null,
      x = null
    for (let i = 0; i < dragState.lines.y.length; i++) {
      const { top: t, showTop: s } = dragState.lines.y[i]
      // 如果小于5像素 说明横向的线接近了
      if (Math.abs(t - top) < 5) {
        y = s //线要显示的位置

        // 实现吸附效果
        moveY = dragState.startY - dragState.startTop + t //容器距离顶部的距离
        break
      }
    }

    for (let i = 0; i < dragState.lines.x.length; i++) {
      const { left: L, showLeft: s } = dragState.lines.x[i]
      // 如果小于5像素 说明纵向的线接近了
      if (Math.abs(L - left) < 5) {
        x = s //线要显示的位置

        // 实现吸附效果
        moveX = dragState.startX - dragState.startLeft + L //容器距离顶部的距离
        break
      }
    }
    markLine.x = x
    markLine.y = y

    let durX = moveX - dragState.startX
    let durY = moveY - dragState.startY

    focusData.value.focus.forEach((block, idx) => {
      block.top = dragState.startPos[idx].top + durY
      block.left = dragState.startPos[idx].left + durX
    })
  }
  const mouseup = (e) => {
    document.removeEventListener('mousemove', mousemove)
    document.removeEventListener('mouseup', mouseup)
    markLine.x = null
    markLine.y = null
    if (dragState.dragging) {
      dragState.dragging = false
      events.emit('end')
    }
  }

  const mousedown = (e) => {
    const { width: BWidth, height: BHeight } = lastSelectBlock.value

    dragState = {
      startX: e.clientX,
      startY: e.clientY,
      startLeft: lastSelectBlock.value.left, //当前拖拽元素拖拽前的Left
      startTop: lastSelectBlock.value.top, //当前拖拽元素拖拽前的Top
      dragging: false,
      startPos: focusData.value.focus.map(({ top, left }) => ({ top, left })),
      lines: (() => {
        // 辅助线计算
        // 获取其他未选中的
        const { unfocused } = focusData.value
        // 计算横线的位置 用Y存放  X存放纵向
        let lines = { x: [], y: [] }
        ;[
          ...unfocused,
          {
            top: 0,
            left: 0,
            width: config.value.container.width,
            height: config.value.container.height
          }
        ].forEach((block) => {
          const {
            top: ATop,
            left: ALeft,
            width: AWidth,
            height: AHeight
          } = block
          // 当此元素拖拽到和A元素top一致的位置  就显示辅助线 辅助线的位置就是ATop
          lines.y.push({ showTop: ATop, top: ATop })
          // 当此元素的底部和A元素top一致的位置
          lines.y.push({ showTop: ATop, top: ATop - BHeight })
          // 当此元素的中间和A元素中间 一致
          lines.y.push({
            showTop: ATop + AHeight / 2,
            top: ATop + AHeight / 2 - BHeight / 2
          })
          // 当此元素的顶部和A元素底部 一致
          lines.y.push({
            showTop: ATop + AHeight,
            top: ATop + AHeight
          })
          // 当此元素的底部和A元素底部 一致
          lines.y.push({
            showTop: ATop + AHeight,
            top: ATop + AHeight - BHeight
          })
          // 当此元素的左边和A元素左边 一致
          lines.x.push({ showLeft: ALeft, left: ALeft })
          // 当此元素的左边和A元素右边 一致
          lines.x.push({ showLeft: ALeft + AWidth, left: ALeft + AWidth })

          // 当此元素的中间和A元素中间 一致
          lines.x.push({
            showLeft: ALeft + AWidth / 2,
            left: ALeft + AWidth / 2 - BWidth / 2
          })

          // 当此元素的右边和A元素右边 一致
          lines.x.push({
            showLeft: ALeft + AWidth,
            left: ALeft + AWidth - BWidth
          })
          // 当此元素的右边和A元素左边 一致
          lines.x.push({
            showLeft: ALeft,
            left: ALeft - BWidth
          })
        })
        return lines
      })()
    }
    document.addEventListener('mousemove', mousemove)
    document.addEventListener('mouseup', mouseup)
  }
  return {
    mousedown,
    markLine
  }
}
