import {createApp, nextTick} from 'vue'
import { mount, shallowMount } from '@vue/test-utils'
import Vuetable from 'components/Vuetable.vue'
import {expect, jest, describe, it} from '@jest/globals'

describe('Vuetable - Features', () => {

  const mountVuetable = (fields) => mount(Vuetable, {
    propsData: {
      loadOnStart: false,
      fields
    }
  })

  const shallowVuetable = (fields) => shallowMount(Vuetable, {
    propsData: {
      loadOnStart: false,
      fields
    }
  })

  /**
   * title
   */
  it('should render HTML in title', () => {
    const wrapper = mountVuetable([
      { name: 'code', title: 'Hi, <strong>there</strong>' }
    ])

    expect(wrapper.find('thead tr th.vuetable-th-code').element.innerHTML)
      .toEqual('Hi, <strong>there</strong>')
  })

  it('should call the function to get title value if title is a Function', () => {
    const myFunc = () => {
      return 'My Title'
    }

    const wrapper = mountVuetable([
      { name: 'code', title: myFunc }
    ])

    expect(typeof(wrapper.vm.tableFields[0].title)).toEqual('function')
    expect(wrapper.vm.tableFields[0].title).toBe(myFunc)
    expect(wrapper.find('thead tr th.vuetable-th-code').element.innerHTML)
      .toEqual('My Title')
  })

  it('should replace "." with a space if title has not been set and name has "." in it', () => {
    const wrapper = mountVuetable(['code.line'])

    expect(wrapper.find('thead tr th.vuetable-th-code_line').element.innerHTML)
      .toEqual('Code Line')
  })

  /*
   * Data mode
   */
  describe('Data mode', () => {
    let data, pagination

    beforeEach( () => {
      data = [{'code': '111'}, {'code': '222'}]
      pagination = {'total': 0}
    })

    it('can display data array from "data" prop', (done) => {
      const app = createApp({})
      const wrapper = shallowMount(Vuetable, {
        propsData: {
          apiMode: false,
          fields: ['code'],
          data: data,
        }
      })

      app.config.errorHandler = done
      nextTick( () => {
        const nodes = wrapper.findAll('td.vuetable-td-code')
        expect(nodes[0].text()).toEqual('111')
        expect(nodes[1].text()).toEqual('222')
        done()
      })
    })

    it('can display data in an object from "data" prop', (done) => {
      const app = createApp({})
      const wrapper = shallowMount(Vuetable, {
        propsData: {
          apiMode: false,
          fields: ['code'],
          dataPath: 'data',
          paginationPath: 'pagination',
          trackBy: 'code',
          data: {
            'data': data,
            'pagination': pagination
          },
        }
      })

      app.config.errorHandler = done
      nextTick( () => {
        expect(wrapper.vm.tableData).toStrictEqual(data)
        expect(wrapper.vm.tablePagination).toStrictEqual(pagination)

        const nodes = wrapper.findAll('td.vuetable-td-code')
        expect(nodes[0].text()).toEqual('111')
        expect(nodes[1].text()).toEqual('222')
        done()
      })
    })

    it('calls user defined data-manager function', (done) => {
      const app = createApp({})
      const func = jest.fn()
      const wrapper = shallowMount(Vuetable, {
        propsData: {
          apiMode: false,
          fields: ['code'],
          dataPath: 'data',
          paginationPath: 'pagination',
          trackBy: 'code',
          data: {
            'data': data,
            'pagination': pagination
          },
          dataManager: func,
        }
      })

      expect(wrapper.vm.dataManager).toBe(func)
      app.config.errorHandler = done
      nextTick( () => {
        expect(func).toHaveBeenCalledWith([], {
          'current_page': 1,
          'from': 1,
          'last_page': 0,
          'next_page_url': '',
          'per_page': 10,
          'prev_page_url': '',
          'to': 0,
          'total': 0
        })
        done()
      })
    })
  })
})
