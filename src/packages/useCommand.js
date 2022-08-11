import deepcopy from 'deepcopy'
import { onUnmounted } from 'vue'
import { events } from './event'

export function useCommand(config, focusData) {
  const state = {
    // 前进后退需要指针
    current: -1, // 前进后退的索引值
    queue: [], // 队列存放所有的操作指令
    commands: {}, // 制作命令和执行功能一个映射表
    commandArray: [], // 存放所有的命令
    destroyArray: [] // 存放所有要销毁的订阅
  }

  const registry = (command) => {
    state.commandArray.push(command)
    state.commands[command.name] = (...args) => {
      const { redo, undo } = command.execute(...args)
      redo()
      if (!command.pushQueue) {
        // 不需要放在队列中 直接跳过
        return
      }
      let { queue, current } = state
      // 组件1 -- 组件2 -- 撤销组件2 -- 组件3
      // 组件1 -- 组件3
      if (queue.length > 0) {
        queue = queue.slice(0, current + 1) // 可能在放置过程中有撤销操作，所以根据当前最新的current值来计算新的队列
        state.queue = queue
      }
      queue.push({ redo, undo }) //保持前进和后退
      state.current = current + 1
      // console.log(queue)
    }
  }

  // 注册需要的命令
  // 还原
  registry({
    name: 'redo',
    keyboard: 'ctrl+y',
    execute() {
      return {
        redo() {
          let item = state.queue[state.current + 1] // 还原撤销
          if (item) {
            item.redo && item.redo()
            state.current++
          }
        }
      }
    }
  })
  // 撤销
  registry({
    name: 'undo',
    keyboard: 'ctrl+z',
    execute() {
      return {
        redo() {
          console.log(state.current, state.queue)
          if (state.current === -1) return // 没有可撤销的了
          let item = state.queue[state.current] // 找到上一步还原
          if (item) {
            item.undo && item.undo() // 这里没有操作队列
            state.current--
          }
        }
      }
    }
  })

  registry({
    // 如果希望将操作放到队列中可以增加一个属性， 标识等会操作要放到队列中
    name: 'drag',
    pushQueue: true,
    init() {
      // 初始化操作 默认就会执行
      this.before = null
      // 监控拖拽开始事件，保存状态
      const start = () => (this.before = deepcopy(config.value.blocks))
      // 拖拽之后需要出发对应的指令
      const end = () => state.commands.drag()
      events.on('start', start)
      events.on('end', end)
      return () => {
        //销毁
        events.off('start', start)
        events.off('end', end)
      }
    },
    execute() {
      let before = this.before
      let after = config.value.blocks // 之后状态
      return {
        redo() {
          // 默认 直接把当前事情做了
          config.value = { ...config.value, blocks: after }
        },
        undo() {
          // 前一步
          config.value = { ...config.value, blocks: before }
        }
      }
    }
  })

  registry({
    name: 'updateContainer', // 更新整个容器
    pushQueue: true,
    execute(newValue) {
      let state = {
        before: config.value,
        after: newValue
      }
      return {
        redo: () => {
          config.value = state.after
        },
        undo: () => {
          config.value = state.before
        }
      }
    }
  })

  registry({
    name: 'updateBlock', //更新某一个组件
    pushQueue: true,
    execute(newValue, oldBlock) {
      let state = {
        before: config.value.blocks,
        after: (() => {
          let blocks = [...config.value.blocks]
          const index = config.value.blocks.indexOf(oldBlock)
          if (index > -1) {
            blocks.splice(index, 1, newValue)
          }
          return blocks
        })()
      }
      return {
        redo: () => {
          config.value = { ...config.value, blocks: state.after }
        },
        undo: () => {
          config.value = { ...config.value, blocks: state.before }
        }
      }
    }
  })

  registry({
    //置顶
    name: 'placeTop',
    pushQueue: true,
    execute() {
      let state = {
        before: deepcopy(config.value),
        after: (() => {
          let { focus, unfocused } = focusData.value
          let maxZIndex = unfocused.reduce((prev, currentBlock) => {
            return Math.max(prev, currentBlock.zIndex)
          }, -Infinity)

          focus.forEach((block) => (block.zIndex = maxZIndex + 1))
          console.log(config.value)
          return config.value
        })()
      }
      return {
        redo: () => {
          config.value = state.after
        },
        undo: () => {
          config.value = state.before
        }
      }
    }
  })

  registry({
    //置底
    name: 'placeBottom',
    pushQueue: true,
    execute() {
      let state = {
        before: deepcopy(config.value),
        after: (() => {
          let { focus, unfocused } = focusData.value
          let minZIndex =
            unfocused.reduce((prev, currentBlock) => {
              return Math.min(prev, currentBlock.zIndex)
            }, Infinity) - 1

          // focus.forEach((block) => (block.zIndex = maxZIndex - 1))
          if (minZIndex < 0) {
            // 这里如果是负值 则让没选中的向上 自己变为0
            const dur = Math.abs(minZIndex)
            minZIndex = 0
            unfocused.forEach((block) => (block.zIndex += dur))
          }
          focus.forEach((block) => (block.zIndex = minZIndex))
          return config.value
        })()
      }
      return {
        redo: () => {
          config.value = state.after
        },
        undo: () => {
          config.value = state.before
        }
      }
    }
  })

  registry({
    //删除
    name: 'delete',
    pushQueue: true,
    execute() {
      let state = {
        before: deepcopy(config.value),
        after: (() => {
          let { unfocused } = focusData.value
          // focusData.value = unfocused
          return { ...config.value, blocks: unfocused }
        })()
      }
      return {
        redo: () => {
          config.value = state.after
        },
        undo: () => {
          config.value = state.before
        }
      }
    }
  })

  // 按键事件
  const keyboardEvent = () => {
    const keyCodes = {
      90: 'z',
      89: 'y'
    }
    const onKeydown = (ev) => {
      const { ctrlKey, keyCode } = ev
      let keyString = []
      if (ctrlKey) keyString.push('ctrl')
      keyString.push(keyCodes[keyCode])
      keyString = keyString.join('+')
      state.commandArray.forEach(({ keyboard, name }) => {
        if (!keyboard) return // 没有键盘事件
        if (keyboard === keyString) {
          state.commands[name]()
          ev.preventDefault()
        }
      })
    }
    const init = () => {
      //初始化事件
      window.addEventListener('keydown', onKeydown)
      return () => {
        //销毁事件
        window.removeEventListener('keydown', onKeydown)
      }
    }
    return init()
  }

  ;(() => {
    // 监听键盘事件
    state.destroyArray.push(keyboardEvent())
    // 存放所有待销毁订阅
    state.commandArray.forEach(
      (command) => command.init && state.destroyArray.push(command.init())
    )
  })()

  onUnmounted(() => {
    // 清理绑定的事件
    state.destroyArray.forEach((fn) => fn && fn())
  })
  return state
}
