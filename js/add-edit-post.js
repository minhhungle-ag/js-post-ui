import postApi from './api/postApi'
import { initPostForm, toast } from './utils'

function removeUnusedField(formValues) {
    const payload = formValues
    if (payload.imageSource === 'upload') {
        delete payload.imageUrl
    } else delete payload.image

    delete payload.imageSource

    if (!formValues.id) delete payload.id

    return payload
}

function jsonToFormData(jsonObject) {
    const formData = new FormData()

    for (const key in jsonObject) {
        formData.set(key, jsonObject[key])
    }

    return formData
}

async function handlePostFormSubmit(formValues) {
    try {
        const payload = removeUnusedField(formValues)
        const formData = jsonToFormData(payload)

        const savePost = payload.id
            ? await postApi.updateFormData(formData)
            : await postApi.addFormData(formData)

        // show message
        toast.success('Save post successfully!!!')

        setTimeout(() => {
            window.location.assign(`/post-detail.html?id=${savePost.id}`)
        }, 3000)
    } catch (error) {
        console.log('failed to save post: ', error)
        // show message
        toast.error(`Error: ${error.message}`)
    }
}

;(async () => {
    try {
        const queryParams = new URLSearchParams(window.location.search)
        const postId = queryParams.get('id')

        const defaultValues = Boolean(postId)
            ? await postApi.getById(postId)
            : {
                  title: '',
                  description: '',
                  author: '',
                  imageUrl: '',
              }

        initPostForm({
            formId: 'postForm',
            defaultValues: defaultValues,
            onSubmit: (payload) => {
                handlePostFormSubmit(payload)
            },
        })
    } catch (error) {
        console.log('failed to fetch post detail: ', error)
    }
})()
