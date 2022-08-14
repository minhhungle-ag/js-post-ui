import Toastify from 'toastify-js'
import 'toastify-js/src/toastify.css'

export const toast = {
    info(message) {
        Toastify({
            text: message,
            duration: 3000,
            destination: 'https://github.com/apvarun/toastify-js',

            close: true,
            gravity: 'top', // `top` or `bottom`
            position: 'right', // `left`, `center` or `right`

            style: {
                background: '#03a9f4',
            },
        }).showToast()
    },

    success(message) {
        Toastify({
            text: message,
            duration: 3000,
            destination: 'https://github.com/apvarun/toastify-js',

            close: true,
            gravity: 'top', // `top` or `bottom`
            position: 'right', // `left`, `center` or `right`

            style: {
                background: '#4caf50',
            },
        }).showToast()
    },

    error(message) {
        Toastify({
            text: message,
            duration: 3000,
            destination: 'https://github.com/apvarun/toastify-js',

            close: true,
            gravity: 'top', // `top` or `bottom`
            position: 'right', // `left`, `center` or `right`

            style: {
                background: '#ef5350',
            },
        }).showToast()
    },
}
