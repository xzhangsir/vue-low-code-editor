// 获取那些元素被选中了
import { computed, ref } from 'vue'
export function useFocus(config, previewRef, callback) {
  // 最后一个选中的index
  const selectIndex = ref(-1)
  // 最后一个选中的block
  const lastSelectBlock = computed(() => {
    return config.value.blocks[selectIndex.value]
  })

  const focusData = computed(() => {
    let focus = []
    let unfocused = []
    config.value.blocks.forEach((block) =>
      (block.focus ? focus : unfocused).push(block)
    )

    return { focus, unfocused }
  })
  const clearBlockFocus = () => {
    config.value.blocks.forEach((block) => (block.focus = false))
  }

  const blockMousedown = (e, block, index) => {
    if (previewRef.value) return
    e.preventDefault()
    e.stopPropagation()

    // block 上我们规划一个属性 focus
    // 获取焦点后就将focus变为true
    if (e.shiftKey) {
      // 按住shiftKey键
      if (focusData.value.focus.length <= 1) {
        // 当前只有一个节点被选中时 按住shift键也不会切换状态
        block.focus = true
      } else {
        block.focus = !block.focus
      }
    } else {
      if (!block.focus) {
        clearBlockFocus()
        block.focus = true //清空其他组件的focus
      }
    }

    selectIndex.value = index

    callback(e)
  }

  // 点击容器失去选中
  const containerMousedown = () => {
    if (previewRef.value) return
    selectIndex.value = -1
    clearBlockFocus()
  }

  return {
    containerMousedown,
    blockMousedown,
    focusData,
    clearBlockFocus,
    lastSelectBlock
  }
}
