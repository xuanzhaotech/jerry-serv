import xss from 'xss'
const { article: Article } = require('../service')
const { controller, get, del, put, post, required } = require('../lib/decorator')

@controller('/api/article')
export class articleController {
  @get('/')
  async get(ctx) {
    // const { page, size, type } = ctx.query
    const data = await Article.fetchList(ctx.query)
    ctx.body = {
      success: true,
      data
    }
  }

  @get('/:_id')
  async detail(ctx) {
    const { _id } = ctx.params

    const { username, userid } = ctx.query

    const data = await Article.fetchDetail({_id, username, userid})

    ctx.body = {
      success: true,
      data
    }
  }

  @post('/')
  async post(ctx) {
    let data = ctx.request.body

    if (!data.pubdate) {
      data.pubdate = Date.now()
    }

    // TODO: 修正业务逻辑-根据不同角色用户改变status

    // 默认提交则自动审核
    if (data.status === 1) {
      data.status = 9
    }

    data = {
      title: xss(data.title),
      desc: xss(data.desc),
      cover: xss(data.cover),
      pubdate: xss(data.pubdate),
      content: xss(data.content),
      type: xss(data.type),
      status: xss(data.status),
      openness: xss(data.openness),
      password: xss(data.password),
      isTop: Boolean(data.isTop),
      tags: data.tags,
      author: xss(data.author)
      // to test
      // likeList: data.likeList
    }

    try {
      data = await Article.create(data)
      ctx.body = {
        data,
        success: true
      }
    } catch (err) {
      ctx.body = {
        err,
        success: false
      }
    }
  }

  @put('/')
  async put(ctx) {
    let data = ctx.request.body
    // TODO: 修正业务逻辑-根据不同角色用户改变status

    // 默认提交则自动审核
    if (data.status === 1) {
      data.status = 9
    }

    data = {
      _id: xss(data._id),
      title: xss(data.title),
      desc: xss(data.desc),
      cover: xss(data.cover),
      pubdate: xss(data.pubdate),
      content: xss(data.content),
      type: xss(data.type),
      status: xss(data.status),
      openness: xss(data.openness),
      password: xss(data.password),
      isTop: Boolean(data.isTop),
      tags: data.tags
    }

    try {
      data = await Article.update(data)
      ctx.body = {
        data,
        success: true
      }
    } catch (error) {
      ctx.body = {
        error,
        success: false
      }
    }
  }

  @del('/:_id')
  async delete(ctx) {
    const { _id } = ctx.params
    const data = await Article.remove(_id)
    
    ctx.body = {
      success: true,
      data
    }
  }
}
