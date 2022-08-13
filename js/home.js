import dayjs from 'dayjs'
import postApi from './api/axiosClient'
import { setTextContent, truncateText } from './utils'
import relativeTime from 'dayjs/plugin/relativeTime'

dayjs.extend(relativeTime)

function createPostElement(post) {
    // find and clone template
    const postItemTemplate = document.getElementById('postItemTemplate')
    if (!postItemTemplate) return

    const liElement = postItemTemplate.content.firstElementChild.cloneNode(true)
    if (!liElement) return

    // update title, description, thumbnail, author

    setTextContent(liElement, '[data-id="title"]', post.title)
    setTextContent(liElement, '[data-id="description"]', truncateText(post.description, 100))
    setTextContent(liElement, '[data-id="author"]', post.author)
    setTextContent(liElement, '[data-id="timeSpan"]', `- ${dayjs(post.updatedAt).fromNow()}`)

    const thumbnailElement = liElement.querySelector('[data-id="thumbnail"]')
    if (thumbnailElement) {
        thumbnailElement.src = post.imageUrl
        thumbnailElement.addEventListener('error', () => {
            thumbnailElement.src = 'https://picsum.photos/id/197/1368/400' // https://via.placeholder.com/1368x400.png?text=thumbnail
        })
    }

    // attack event

    return liElement
}

function renderPostList(postList) {
    if (!Array.isArray(postList) || postList.length === 0) return

    const ulElement = document.getElementById('postsList')
    if (!ulElement) return

    postList.forEach((post) => {
        const liElement = createPostElement(post)
        ulElement.appendChild(liElement)
    })
}

;(async () => {
    try {
        const params = {
            _page: 1,
            _limit: 6,
        }

        const { data, pagination } = await postApi.getAll(params)

        renderPostList(data)
    } catch (error) {
        console.log('get all failed', error)
    }
})()
