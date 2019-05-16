// Just to show component can be re-usable
// Params: @parentEl: The element in which, the new component will be created
// @limit: no of rec to be shown
function FilterComponent(parentEl, limit) {
    // driven by user config
    this.limit = limit ? limit : 10;
    this.parent = parentEl ? parentEl : document.getElementsByTagName('body')[0];

    this.page = 1;
    this.eofReached = false;
    this.sort = 'asc';
    this.listDiv;
    this.listArea;
    this.searchedField;
    this.orderBy;

    console.log('Params: ', this.parent, this.limit)
    this.createComponent();
}

FilterComponent.prototype.createComponent = function () {
    const me = this;
    // TODO: Check for custom parent

    const topEl = document.createElement('div');
    topEl.setAttribute('class', 'filter-component');
    this.parent.appendChild(topEl);
    topEl.innerHTML =
        `<div class="content-div">
            <input type="text" class="search-field" placeholder="Search">
        </div>

        <div class="content-div">
            Order By: <div class="order-by">Descending</div>
        </div>

        <div class="content-div list-div" tabindex="0">
            <ul class="card list-area">

            </ul>
        </div>`;

    me.listDiv = topEl.querySelector('.list-div');
    me.listArea = topEl.querySelector('.list-area');
    me.searchedField = topEl.querySelector('.search-field');
    me.orderBy = topEl.querySelector('.order-by');

    me.searchedField.addEventListener('keyup', function (event) {
        if (event.type === 'keyup') {
            me.eofReached = false;
            me.page = 1;
        }
        me.listArea.innerHTML = '';
        me.debounce(me.loadList, 250, false)();
    });

    me.orderBy.addEventListener('click', function (event) {
        me.manageSort();
    });

    me.listDiv.addEventListener('scroll', function () {
        if (me.listDiv.scrollTop + me.listDiv.clientHeight >= me.listDiv.scrollHeight) {
            me.page++;
            me.loadList();
        }
    });
}

FilterComponent.prototype.debounce = function (func, wait, immediate) {
    let timeout;
    const args = Array.prototype.slice.call(arguments, 3);
    const me = this;
    return function () {
        const context = this;
        let callNow = immediate && !timeout;
        clearTimeout(timeout);
        //const args = arguments;
        timeout = setTimeout(function () {
            timeout = null;
            if (!immediate) func.apply(me, args);
        }, wait)

        //timeout = setTimeout(later, wait);
        if (callNow) func.apply(context, args);
    };
};

FilterComponent.prototype.manageSortingOption = function () {
    const me = this;
    let text = '';

    if (me.sort === 'asc') {
        text = 'Descending';
        me.sort = 'desc';
    } else {
        text = 'Ascending';
        me.sort = 'asc';
    }
    me.orderBy.innerHTML = text;
}

FilterComponent.prototype.manageSort = function () {
    const me = this;
    const searchedValue = me.searchedField.value.trim();

    if (searchedValue === '') {
        alert('Please enter some value to filter');
        return;
    }
    me.page = 1;
    me.listArea.innerHTML = '';
    me.eofReached = false;
    me.loadList();
}

FilterComponent.prototype.loadList = function () {
    const me = this;
    const searchedValue = me.searchedField.value.trim();
    let url = 'http://5cdc339c069eb30014202b21.mockapi.io/api/v1/search?page=' +
        me.page + '&limit=' + me.limit + '&sortBy=name&order=' + me.sort;

    if (searchedValue !== '') {
        url = url + '&filter=' + searchedValue;
    } else {
        alert('Please enter some value to filter');
        return;
    }

    // No call after reaching end of search result
    if (me.eofReached) {
        return;
    }

    let xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            if (this.responseText) {
                const originalList = JSON.parse(this.responseText);
                // const listArea = document.getElementById('listArea');
                let listContent = '';
                originalList.forEach(function (rec) {
                    listContent += '<li>' + rec['name'] + '</li>';
                }, this);

                if (originalList.length === 0) {
                    listContent = '<strong>No Records Found</strong>';
                }
                me.listArea.innerHTML += listContent;

                let listLength = me.listArea.querySelectorAll('li').length;
                if (listLength % me.limit !== 0 && !me.eofReached) {
                    me.eofReached = true;
                }

                me.manageSortingOption();
            }
        }
    };
    xhttp.open('GET', url, true);
    xhttp.send();
};


window.onload = function () {
    const c1 = new FilterComponent(document.getElementById('test'), 15);
    const c2 = new FilterComponent();
}