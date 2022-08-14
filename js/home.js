import postApi from './api/axiosClient'
import { initPagination, initSearch, renderPagination, renderPostList } from './utils'

async function handleFilterChange(filterName, filterValue) {
    try {
        //update query params
        const url = new URL(window.location)
        url.searchParams.set(filterName, filterValue)
        if (filterName === 'title_like') url.searchParams.set('_page', 1)
        history.pushState({}, '', url)

        // fetch API

        // re-render post list
        const { data, pagination } = await postApi.getAll(url.searchParams)
        renderPostList('postsList', data)
        renderPagination('pagination', pagination)
    } catch (error) {
        console.log('failed to fetch post list: ', error)
    }
}

//------ MAIN ------//
;(async () => {
    try {
        const url = new URL(window.location)

        // update search params if needed
        if (!url.searchParams.get('_page')) url.searchParams.set('_page', 1)
        if (!url.searchParams.get('_limit')) url.searchParams.set('_limit', 6)

        history.pushState({}, '', url)
        const queryParams = url.searchParams

        // filter
        initPagination({
            elementId: 'pagination',
            defaultParams: queryParams,
            onChange: (page) => handleFilterChange('_page', page),
        })
        initSearch({
            elementId: 'searchInput',
            defaultParams: queryParams,
            onChange: (value) => handleFilterChange('title_like', value),
        })

        // render post list based URL params
        const { data, pagination } = await postApi.getAll(queryParams)
        renderPostList('postsList', data)
        renderPagination('pagination', pagination)
    } catch (error) {
        console.log('get all failed', error)
    }
})()
