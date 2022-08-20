import { randomNumber, setBackgroundImage, setFieldValue, setTextContent } from './common'
import * as yup from 'yup'

const ImageSource = {
    PICSUM: 'picsum',
    UPLOAD: 'upload',
}

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

        imageSource: yup
            .string()
            .required('Please select an image source')
            .oneOf([ImageSource.PICSUM, ImageSource.UPLOAD], 'Invalid image source'),

        imageUrl: yup.string().when('imageSource', {
            is: ImageSource.PICSUM,
            then: yup
                .string()
                .required('Please random background image')
                .url('Please enter valid value!'),
        }),

        image: yup.mixed().when('imageSource', {
            is: ImageSource.UPLOAD,
            then: yup
                .mixed()
                .test('required', 'Please selected an image to upload', (value) =>
                    Boolean(value?.name)
                )
                .test('max-10mb', 'The image is too (max 10mb)', (file) => {
                    const fileSize = file?.size || 0
                    const MAX_SIZE = 10000000

                    return fileSize <= MAX_SIZE
                }),
        }),
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
        ;['title', 'author', 'imageUrl', 'image'].forEach((name) => setFieldError(form, name, ''))

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

async function validateFormField(form, formValue, name) {
    try {
        const schema = getPostSchema()
        setFieldError(form, name, '')
        await schema.validateAt(name, formValue)
    } catch (error) {
        console.log('Error: ', error)

        setFieldError(form, name, error.message)
    }

    const field = form.querySelector(`[name="${name}"]`)

    if (field && !field.checkValidity()) {
        field.parentElement.classList.add('was-validated')
    }
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

function renderImageSourceControl(form, selectedValue) {
    const controlList = form.querySelectorAll('[data-id="imageSource"]')
    if (controlList) {
        controlList.forEach((control) => {
            control.hidden = control.dataset.imageSource !== selectedValue
        })
    }
}

function initRadioImageSource(form) {
    const radioList = form.querySelectorAll('[name="imageSource"]')
    if (radioList) {
        radioList.forEach((radio) => {
            radio.addEventListener('change', (event) => {
                renderImageSourceControl(form, event.target.value)
            })
        })
    }
}

function initUploadImage(form) {
    const uploadImage = form.querySelector('[name="image"]')
    if (!uploadImage) return

    uploadImage.addEventListener('change', (event) => {
        // get selected file
        const file = event.target.files[0]
        if (file) {
            const imageUrl = URL.createObjectURL(file)
            setBackgroundImage(document, '#postHeroImage', imageUrl)

            validateFormField(form, { imageSource: ImageSource.UPLOAD, image: file }, 'image')
        }
    })
}

function initValidationOnchange(form) {
    ;['title', 'author'].forEach((name) => {
        const field = form.querySelector(`[name="${name}"]`)
        if (field) {
            field.addEventListener('input', (event) => {
                const newValue = event.target.value
                validateFormField(form, { [name]: newValue }, name)
            })
        }
    })
}

export function initPostForm({ formId, defaultValues, onSubmit }) {
    const form = document.getElementById(formId)
    if (!form) return

    let submitting = false
    setFormValue(form, defaultValues)

    // init event
    initRandomImage(form)
    initRadioImageSource(form)
    initUploadImage(form)
    initValidationOnchange(form)

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
