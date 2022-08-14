import dayjs from 'dayjs'
import postApi from './api/axiosClient'
import { registerLightBox, setTextContent } from './utils'

function renderPostDetail(post) {
    if (!post) return
    // render title
    setTextContent(document, '#postDetailTitle', post.title)

    // render description
    setTextContent(document, '#postDetailDescription', post.description)

    // render author
    setTextContent(document, '#postDetailAuthor', post.author)

    // render updatedAt
    setTextContent(
        document,
        '#postDetailTimeSpan',
        `- ${dayjs(post.updatedAt).format('DD/MM/YYYY HH:mm')}`
    )

    // render hero image
    const heroImgEl = document.getElementById('postHeroImage')
    if (heroImgEl) {
        heroImgEl.style.backgroundImage = `url(${post.imageUrl})`
        heroImgEl.addEventListener('error', () => {
            heroImgEl.style.backgroundImage = 'https://picsum.photos/id/197/1368/400' // https://via.placeholder.com/1368x400.png?text=thumbnail
        })
    }

    // render edit page link
    const editPageLink = document.getElementById('goToEditPageLink')
    if (editPageLink) {
        editPageLink.href = `/add-edit-post.html?id=${post.id}`
        editPageLink.innerHTML = `<i class="fas fa-edit"></i> Edit post`
    }
}

;(async () => {
    registerLightBox({
        modalId: 'lightbox',
        imageSelector: 'img[data-id="lightboxImg"]',
        prevSelector: 'button[data-id="lightboxPrev"]',
        nextSelector: 'button[data-id="lightboxNext"]',
    })
    registerLightBox({
        modalId: 'lightbox',
        imageSelector: 'img[data-id="lightboxImg"]',
        prevSelector: 'button[data-id="lightboxPrev"]',
        nextSelector: 'button[data-id="lightboxNext"]',
    })
    registerLightBox({
        modalId: 'lightbox',
        imageSelector: 'img[data-id="lightboxImg"]',
        prevSelector: 'button[data-id="lightboxPrev"]',
        nextSelector: 'button[data-id="lightboxNext"]',
    })

    // get post id form URL
    // fetch post detail API
    // render post detail

    try {
        const searchParams = new URLSearchParams(window.location.search)
        const postId = searchParams.get('id')

        if (!postId) {
            console.log('Post not found')
            return
        }

        const post = await postApi.getById(postId)
        renderPostDetail(post)
    } catch (error) {
        console.log('failed to fetch post detail: ', error)
    }
})()
