const matter = require('gray-matter');
const glob   = require('glob');
const fs     = require('fs');
const marked = require('marked');
const hljs   = require('highlight.js');
const fetch  = require('node-fetch');
const inquirer = require('inquirer');

let articles
try {
  articles = require('./src/articles.json')
} catch (error) {
  articles = []
}

marked.setOptions({
  highlight: code => hljs.highlightAuto(code).value
})

const results = []
const introTag = '--intro--'
const thumbUrl = 'https://api.unsplash.com/photos/random?client_id=cd8f6ebac5a5ed217bc4674a5fe851f30eb6e92686b8d027adadf602048b49fa'
const imgReg = /!\[(.*)\]\((.*\.(jpg|jpeg|png|gif|image)(\?[^)]*)?)\)/g
const imageNameReg = /^.*\.(jpg|jpeg|png|gif|image)$/
const ghName = 'xiao555'
const ghEmail = 'zhangruiwu32@gmail.com'
const cdnRepoLink = 'https://api.github.com/repos/xiao555/netlify'
const cdnLink = 'https://xiao555.netlify.com'

/**
 * 上传图片到github
 * @param {String} name - 图片名
 * @param {String} url - 图片源链接
 * @param {String} ghToken - github token
 */
async function uploadImage (name, url, ghToken) {
  let imgData = await fetch(url).then(r => r.buffer())
  let response = await fetch(`${cdnRepoLink}/contents/${name}`, {
    method: 'PUT',
    headers: {
      'Authorization': `token ${ghToken}`
    },
    body: JSON.stringify({
      message: `upload ${name}`,
      committer: {
        name: ghName,
        email: ghEmail
      },
      content: imgData.toString('base64')
    })
  }).catch(e => console.error(e))
  if (response.ok) {
    return true
  } else {
    return false
  }
}

;(async () => {
  const { ghToken } = await inquirer.prompt([
    {
      name: 'ghToken',
      type: 'input',
      message: '请输入github token：',
    }
  ])
  try {
    // 获取github静态资源
    const repoContents = await fetch(`${cdnRepoLink}/contents/`).then(r => r.json())
    const repoFiles = repoContents.map(content => content.name)
    const currArticlesMap = articles.reduce((pre, cur) => {
      pre[cur.id] = cur
      return pre
    }, {})

    const posts = glob.sync('./src/posts/*.md')
    for (let i = 0; i < posts.length; i++) {
      const post = posts[i];
      const res = {}
      let { content, data } = matter(fs.readFileSync(post, 'utf8'));
      console.log(`开始处理: ${data.title}`)
      // 检测是否有图片
      if (imgReg.test(content)) {
        const replaceMap = {}
        content.replace(imgReg, (match, name, url) => {
          // 图片名称没有的默认用链接最后一项
          if (!imageNameReg.test(name)) name = url.split('/').pop().split('?')[0]
          replaceMap[name] = {
            originUrl: url
          }
        })
        let ignoreDuplicateFile = false
        let entries = Object.entries(replaceMap)
        for (let j = 0; j < entries.length; j++) {
          let [name, { originUrl: url }] = entries[j];
          console.log('检测到图片: ', name, url)
          if (repoFiles.includes(name) && url.includes(cdnLink)) {
            // 已上传github且url是cdn的链接 跳过不处理
            continue
          } else {
            let needUpload = true
            let ext = url.match(/\.(jpg|jpeg|png|gif|image)/)[1]
            // 如果github存在同名文件，询问是否跳过或重命名
            if (repoFiles.includes(name)) {
              // 全部跳过
              if (ignoreDuplicateFile) {
                needUpload = false
              } else {
                const { METHOD } = await inquirer.prompt([
                  {
                    name: 'METHOD',
                    type: 'list',
                    message: `存在同名文件${name}，请选择处理方式：`,
                    choices: ['跳过本次', '全部跳过', '重命名']
                  }
                ])
                if (METHOD === '跳过本次') {
                  needUpload = false
                } else if (METHOD === '全部跳过') {
                  ignoreDuplicateFile = true
                  needUpload = false
                } else if (METHOD === '重命名') {
                  const { NAME } = await inquirer.prompt([
                    {
                      name: 'NAME',
                      type: 'input',
                      message: '请输入名称(不带后缀)：',
                    }
                  ])
                  name = `${NAME}.${ext}`
                }
              }
            }
            let uploaded = true
            if (needUpload) {
              let bool = await uploadImage(name, url, ghToken)
              if (!bool) {
                uploaded = false
                console.log(`上传图片失败: ${url}`)
              }
            }
            if (uploaded) {
              // 上传成功替换原链接，md文件同步修改
              content = content.replace(`(${url})`, `(${cdnLink}/${name})`)
              let sourceContent = fs.readFileSync(post, 'utf8')
              fs.writeFileSync(post, sourceContent.replace(`(${url})`, `(${cdnLink}/${name})`))
            }

          }
        }
      }
      if (content.includes(introTag)) {
        let [before, after] = content.split(introTag)
        res.intro = marked(before)
        res.content = marked(before + after)
      } else {
        res.content = marked(content)
      }
      data.slug = encodeURIComponent(data.slug.replace(/ +/g, '-').toLowerCase())
      data.id = data.slug
      results.push({
        ...res,
        ...data
      })
    }
    results.sort((a,b) => b.createDate - a.createDate)
    for (let i = 0; i < results.length; i++) {
      const post = results[i];
      if (currArticlesMap[post.id] && currArticlesMap[post.id].thumb) {
        post.thumb = currArticlesMap[post.id].thumb
      } else {
        console.log('请求缩略图...')
        const response = await fetch(thumbUrl).then(r => r.json())
        post.thumb = response.urls.small
      }
    }
    // save
    fs.writeFileSync('./src/articles.json', JSON.stringify(results), 'utf-8')
    console.log('文章处理完成')
  } catch (e) {
    console.log(e);
  }
})()
