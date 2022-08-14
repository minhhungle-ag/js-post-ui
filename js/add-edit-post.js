import postApi from './api/axiosClient'
import { initPostForm, toast } from './utils'

async function handlePostFormSubmit(formValues) {
    try {
        const savePost = formValues.id
            ? await postApi.update(formValues)
            : await postApi.add(formValues)

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
            onSubmit: (formValues) => {
                handlePostFormSubmit(formValues)
            },
        })
    } catch (error) {
        console.log('failed to fetch post detail: ', error)
    }
})()
