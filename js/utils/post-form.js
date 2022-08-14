import { randomNumber, setBackgroundImage, setFieldValue, setTextContent } from './common'
import * as yup from 'yup'

function setFormValue(form, formValues) {
    setFieldValue(form, '[name="title"]', formValues?.title)
    setFieldValue(form, '[name="description"]', formValues?.description)
    setFieldValue(form, '[name="author"]', formValues?.author)
    setFieldValue(form, '[name="imageUrl"]', formValues?.imageUrl)
    setBackgroundImage(document, '#postHeroImage', formValues.imageUrl)
}

function getFormValues(form) {
    const formValues = {}

    // S1: query each input and add to values object
    // const fieldNameList = ['title', 'author', 'description', 'imageUrl']
    // fieldNameList.forEach((name) => {
    //     const field = form.querySelector(`[name="${name}"]`)
    //     if (field) formValues[name] = field.value
    // })

    // S2: using form data
    const data = new FormData(form)
    for (const [key, value] of data) {
        formValues[key] = value
    }

    return formValues
}

function getPostSchema() {
    return yup.object().shape({
        title: yup.string().required('Please enter title'),
        author: yup
            .string()
            .required('Please enter author')
            .test(
                'at-least-two-words',
                (value) => value.split(' ').filter((x) => !!x && x.length >= 3).length >= 2
            ),
        description: yup.string(),
        imageUrl: yup
            .string()
            .required('Please random backgroun image')
            .url('Please enter valid value!'),
    })
}

function setFieldError(form, name, error) {
    const element = form.querySelector(`[name="${name}"]`)
    if (element) {
        element.setCustomValidity(error)
        setTextContent(element.parentElement, '.invalid-feedback', error)
    }
}

async function validatePostForm(form, formValues) {
    try {
        // reset previous error
        ;['title', 'author', 'imageUrl'].forEach((name) => setFieldError(form, name, ''))

        // start validating
        const schema = getPostSchema()
        await schema.validate(formValues, { abortEarly: false })
    } catch (error) {
        const errorLog = {}

        for (const validationError of error.inner) {
            const name = validationError.path

            // ignore if the field is already logged
            if (errorLog[name]) continue

            // set field error and mark as logged
            setFieldError(form, name, validationError.message)
            errorLog[name] = true
        }
    }

    const isValid = form.checkValidity()
    if (!isValid) form.classList.add('was-validated')
    return isValid
}

function showLoading(form) {
    const button = form.querySelector('[name="submit"]')
    if (button) {
        button.classList.add('disabled')
        button.textContent = 'Saving ...'
    }
}

function hideLoading(form) {
    const button = form.querySelector('[name="submit"]')
    if (button) {
        button.classList.remove('disabled')
        button.innerHTML = `<i class="fas fa-save"></i> Save`
    }
}

function initRandomImage(form) {
    const randomButton = document.getElementById('postChangeImage')
    if (!randomButton) return

    randomButton.addEventListener('click', () => {
        // random id
        // build URL
        const imageUrl = `https://picsum.photos/id/${randomNumber(1000)}/1368/1000`

        // set imageUrl input + background
        setFieldValue(form, '[name="imageUrl"]', imageUrl)
        setBackgroundImage(document, '#postHeroImage', imageUrl)
    })
}

export function initPostForm({ formId, defaultValues, onSubmit }) {
    const form = document.getElementById(formId)
    if (!form) return

    let submitting = false
    setFormValue(form, defaultValues)

    // init event
    initRandomImage(form)

    form.addEventListener('submit', async (event) => {
        event.preventDefault()

        if (submitting) return
        submitting = true

        // show loading / disabled button
        showLoading(form)

        // get form values
        const formValues = getFormValues(form)
        formValues.id = defaultValues.id

        // validation
        // if valid trigger submit callback
        //  otherwise, show validation errors

        const isValid = await validatePostForm(form, formValues)
        if (isValid) {
            await onSubmit?.(formValues)
        }

        hideLoading(form)
        submitting = false
    })
}
