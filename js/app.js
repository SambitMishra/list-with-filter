let page = 1;
let limit = 10;
let eofReached = false;
let sort = 'asc';

window.onload = function () {
    let listElm = document.querySelector('.list-div');
    let searchedField = document.querySelector('#searchField');
    searchedField.addEventListener('keyup', function (event) {
        if (event.type === 'keyup') {
            eofReached = false;
            page = 1;
        }
        document.getElementById('listArea').innerHTML = '';
        loadList();
    });

    listElm.addEventListener('scroll', function (event) {
        if (listElm.scrollTop + listElm.clientHeight >= listElm.scrollHeight) {
            page++;
            loadList();
        }
    });
}

function manageSort() {
    let text;
    const searchedValue = document.getElementById('searchField').value.trim();

    if (searchedValue === '') {
        alert('Please enter some value to filter');
        return;
    }
    page = 1;
    document.getElementById('listArea').innerHTML = '';
    loadList();

    if (sort === 'asc') {
        text = 'Descending';
        sort = 'desc';
    } else {
        text = 'Ascending';
        sort = 'asc';
    }
    document.getElementById('orderBy').innerHTML = text;
}

let loadList = debounce(function () {
    const searchedValue = document.getElementById('searchField').value.trim();
    let url = 'http://5cdc339c069eb30014202b21.mockapi.io/api/v1/search?page=' +
        page + '&limit=' + limit + '&sortBy=name&order=' + sort;

    if (searchedValue !== '') {
        url = url + '&filter=' + searchedValue;
    } else {
        alert('Please enter some value to filter');
        return;
    }

    // No call after reaching end of search result
    if (eofReached) {
        return;
    }

    let xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            if (this.responseText) {
                const originalList = JSON.parse(this.responseText);
                const listArea = document.getElementById('listArea');
                let listContent = '';
                originalList.forEach(function (rec) {
                    listContent += '<li>' + rec['name'] + '</li>';
                }, this);

                if (originalList.length === 0) {
                    listContent = '<strong>No Records Found</strong>';
                }
                listArea.innerHTML += listContent;

                let listLength = document.querySelectorAll('#listArea li').length;
                if (listLength % limit !== 0 && !eofReached) {
                    eofReached = true;
                }
            }
        }
    };
    xhttp.open('GET', url, true);
    xhttp.send();
}, 250);


function debounce(func, wait, immediate) {
    let timeout;
    return function () {
        let context = this,
            args = arguments;
        let later = function () {
            timeout = null;
            if (!immediate) func.apply(context, args);
        };
        let callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(context, args);
    };
};